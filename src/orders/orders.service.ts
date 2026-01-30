import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseService } from '../common/base/base.service';
import { Order, OrderDocument, OrderItem } from '../schemas/order.schema';
import { Role, RoleDocument } from '../schemas/role.schema';
import { CartService } from '../cart/cart.service';
import { CreateDirectOrderDto } from './dto/create-direct-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { generateOrderId } from '../common/utils/helper';
import { populateUserRoles } from '../common/utils/rolePopulat.util';

@Injectable()
export class OrdersService extends BaseService<OrderDocument> {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    private readonly cartService: CartService,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {
    super(orderModel);
    this.searchFields = ['status', 'payment_status', 'shipping_address', 'shipping_phone', 'customer_name', 'order_id'];
  }

  async createDirectOrder(
    userId: string,
    createDirectOrderDto: CreateDirectOrderDto,
  ): Promise<any> {
    const orderItems: OrderItem[] = [];
    let totalAmount = 0;

    for (const item of createDirectOrderDto.items) {
      const product = await this.productsService.findOne(item.product_id);
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.product_id} not found`,
        );
      }

      orderItems.push({
        product_id: product._id as Types.ObjectId,
        name: product.name,
        image: product.images?.[0]?.url || 'https://placehold.co/100',
        price: product.price,
        quantity: item.quantity,
      });

      totalAmount += product.price * item.quantity;

      // Decrease stock
      await this.productsService.decreaseStock(item.product_id, item.quantity);
    }

    const orderId = generateOrderId();

    const defaultWorker = {
      user_id: null,
      name: null,
      phone: null,
      status: null,
      accepted_at: null,
      updated_at: null,
      remark_msg: null,
      status_history: []
    };

    const pickerId = createDirectOrderDto.picker_obj?.id || createDirectOrderDto.picker_id;
    let pickerObj: any = { ...defaultWorker };
    if (pickerId) {
      try {
        const picker = await this.usersService.findOne(pickerId);
        if (picker) {
          pickerObj = {
            user_id: picker._id,
            name: `${picker.first_name || ''} ${picker.last_name || ''}`.trim() || picker.username,
            phone: picker.phone_number,
            status: 'assigned',
            updated_at: new Date(),
            remark_msg: createDirectOrderDto.picker_obj?.remark || null,
            status_history: [{ status: 'assigned', changedAt: new Date(), comment: 'Picker assigned during order creation' }]
          };
        }
      } catch (e) {
        console.warn('Failed to fetch picker details:', e.message);
      }
    }

    const packerId = createDirectOrderDto.packer_obj?.id || createDirectOrderDto.packer_id;
    let packerObj: any = { ...defaultWorker };
    if (packerId) {
      try {
        const packer = await this.usersService.findOne(packerId);
        if (packer) {
          packerObj = {
            user_id: packer._id,
            name: `${packer.first_name || ''} ${packer.last_name || ''}`.trim() || packer.username,
            phone: packer.phone_number,
            status: 'assigned',
            updated_at: new Date(),
            remark_msg: createDirectOrderDto.packer_obj?.remark || null,
            status_history: [{ status: 'assigned', changedAt: new Date(), comment: 'Packer assigned during order creation' }]
          };
        }
      } catch (e) {
        console.warn('Failed to fetch packer details:', e.message);
      }
    }

    const paymentMethod = createDirectOrderDto.payment?.method || createDirectOrderDto.payment_method || 'COD';
    const autoStatus = paymentMethod.toLowerCase() === 'cod' ? 'confirmed' : 'pending';
    const finalStatus = createDirectOrderDto.order_status || createDirectOrderDto.status || autoStatus;

    const order = new this.orderModel({
      order_id: orderId,
      user_id: new (Types.ObjectId as any)(userId),
      address_id: new (Types.ObjectId as any)(createDirectOrderDto.address_id),
      // packer_id: packerId ? new (Types.ObjectId as any)(packerId) : undefined,
      // picker_id: pickerId ? new (Types.ObjectId as any)(pickerId) : undefined,
      items: orderItems,
      total_amount: createDirectOrderDto.total_amount || totalAmount,
      // payment_method: paymentMethod,
      // status: finalStatus,
      // payment_status: createDirectOrderDto.payment?.status || 'pending',
      payment_details: {
        method: paymentMethod,
        status: createDirectOrderDto.payment?.status || 'pending',
        transaction_id: createDirectOrderDto.payment?.transaction_id || null,
        gateway: createDirectOrderDto.payment?.gateway ||
          (paymentMethod.toLowerCase() === 'online' ? 'razorpay' : null),
        currency: createDirectOrderDto.payment?.currency || 'INR',
        payable_amount: createDirectOrderDto.payment?.payable_amount || (createDirectOrderDto.total_amount || totalAmount),
        paid_amount: createDirectOrderDto.payment?.paid_amount || 0,
        payment_time: createDirectOrderDto.payment?.payment_time || null,
      },
      order_remark: createDirectOrderDto.order_remark,
      picker_obj: pickerObj,
      packer_obj: packerObj,
      status_history: [
        {
          status: finalStatus,
          changedAt: new Date(),
          comment: 'Order placed',
        },
      ],
    });

    const savedOrder = await order.save();
    return this.findOne((savedOrder as any)._id.toString());
  }

  async updateOrder(id: string, updateOrderDto: UpdateOrderStatusDto, user?: any): Promise<any> {
    const order = await this.orderModel.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Role-based field restrictions
    const userRoleKeys = user?.role?.map((r: any) =>
      typeof r === 'object' ? r.key?.toLowerCase() : r?.toString().toLowerCase()
    ) || [];

    const isAdmin = userRoleKeys.includes('admin') || userRoleKeys.includes('1');
    const isPicker = userRoleKeys.includes('picker');
    const isPacker = userRoleKeys.includes('packer');

    const restrictedStatuses = ['shipped', 'delivered', 'returned', 'cancelled'];
    const isRestricted = restrictedStatuses.includes(order.status.toLowerCase());

    if (isRestricted && isAdmin) {
      const isContentUpdate =
        updateOrderDto.items ||
        updateOrderDto.total_amount !== undefined ||
        updateOrderDto.shipping_address ||
        updateOrderDto.shipping_phone ||
        updateOrderDto.customer_name ||
        updateOrderDto.address_id;

      if (isContentUpdate) {
        throw new BadRequestException(`Cannot update order details when status is ${order.status}`);
      }
    }

    // Apply updates based on roles
    if (isAdmin) {
      if (updateOrderDto.items) {
        order.items = updateOrderDto.items.map((item: any) => ({
          product_id: new (Types.ObjectId as any)(item.product_id),
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          brand_name: item.brand_name,
        }));
      }

      if (updateOrderDto.total_amount !== undefined) {
        order.total_amount = updateOrderDto.total_amount;
      }

      if (updateOrderDto.shipping_address) order.shipping_address = updateOrderDto.shipping_address;
      if (updateOrderDto.shipping_phone) order.shipping_phone = updateOrderDto.shipping_phone;
      if (updateOrderDto.customer_name) order.customer_name = updateOrderDto.customer_name;
      if (updateOrderDto.address_id) order.address_id = new (Types.ObjectId as any)(updateOrderDto.address_id);
      if (updateOrderDto.packer_id) order.packer_id = new (Types.ObjectId as any)(updateOrderDto.packer_id);
      if (updateOrderDto.picker_id) order.picker_id = new (Types.ObjectId as any)(updateOrderDto.picker_id);
      if (updateOrderDto.status) order.status = updateOrderDto.status.toLowerCase();
    }

    if (isPicker) {
      if (updateOrderDto.picker_accepted !== undefined) order.picker_accepted = updateOrderDto.picker_accepted;
      if (updateOrderDto.picker_remark !== undefined) order.picker_remark = updateOrderDto.picker_remark;
      if (updateOrderDto.packer_id) order.packer_id = new (Types.ObjectId as any)(updateOrderDto.packer_id);
      if (updateOrderDto.status) order.status = updateOrderDto.status.toLowerCase();
    }

    if (isPacker) {
      if (updateOrderDto.packer_remark !== undefined) order.packer_remark = updateOrderDto.packer_remark;
      if (updateOrderDto.status) order.status = updateOrderDto.status.toLowerCase();
    }

    // Handle status history if status changed
    if (updateOrderDto.status && order.isModified('status')) {
      order.status_history.push({
        status: order.status,
        changedAt: new Date(),
        comment: `Status updated to ${order.status} by ${userRoleKeys.join('/')}`,
      });
    }

    await order.save();
    return this.findOne(id);
  }

  async findOne(id: string): Promise<any> {
    const order = await this.orderModel
      .findById(id)
      .populate('user_id', '-addresses -password -is_active -is_deleted -status')
      // .populate('packer_id', 'first_name last_name')
      // .populate('picker_id', 'first_name last_name')
      .populate('address_id', '-name -user_id')
      .populate({
        path: 'items.product_id',
        select: '-stock',
        populate: [
          { path: 'category_id', select: 'name' },
          { path: 'subcategory_id', select: 'name' },
          { path: 'brand_id' },
        ],
      })
      .lean()
      .exec();

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const transformed = this.transformOrder(order);

    if (transformed.user) {
      await populateUserRoles(this.roleModel, [transformed.user]);
    }

    return transformed;
  }

  private transformOrder(order: any) {
    const orderObj =
      order instanceof Model
        ? order.toObject({ virtuals: false })
        : typeof order.toObject === 'function'
          ? order.toObject({ virtuals: false })
          : order;

    const { user_id, address_id, ...rest } = orderObj;

    const user = user_id;
    const address = address_id;

    if (user && typeof user === 'object' && 'id' in user) {
      delete (user as any).id;
    }
    if (address && typeof address === 'object' && 'id' in address) {
      delete (address as any).id;
    }

    const items = rest.items.map((item: any) => {
      const product = item.product_id;
      if (product && typeof product === 'object') {
        const productObj =
          product instanceof Model
            ? product.toObject({ virtuals: false })
            : typeof product.toObject === 'function'
              ? product.toObject({ virtuals: false })
              : product;

        if ('id' in productObj) {
          delete (productObj as any).id;
        }

        const { category_id, subcategory_id, brand_id, ...prodRest } = productObj;

        return {
          ...prodRest,
          category: category_id,
          subcategory: subcategory_id,
          brand: brand_id,
          quantity: item.quantity,
        };
      }
      return item;
    });

    const defaultWorker = {
      user_id: null,
      name: null,
      phone: null,
      status: null,
      accepted_at: null,
      updated_at: null,
      remark_msg: null,
      status_history: []
    };

    return {
      ...rest,
      user,
      address,
      items,
      picker_obj: rest.picker_obj || defaultWorker,
      packer_obj: rest.packer_obj || defaultWorker,
    };
  }

  async findAllWithFilters(options: {
    filter?: string;
    sort?: string;
    limit?: number;
    skip?: number;
  }): Promise<any[]> {
    const { filter, sort, limit, skip } = options;
    let query = {};
    if (filter) {
      try {
        query = JSON.parse(filter);
      } catch (e) {
        console.warn('Invalid JSON filter:', filter);
      }
    }

    let sortOptions: any = { createdAt: -1 };
    if (sort) {
      try {
        sortOptions = JSON.parse(sort);
      } catch (e) {
        sortOptions = sort;
      }
    }

    const orders = await this.orderModel
      .find(query)
      .sort(sortOptions)
      .limit(limit ? Number(limit) : 0)
      .skip(skip ? Number(skip) : 0)
      .populate('user_id', '-addresses -password')
      .populate('packer_id', 'first_name last_name')
      .populate('picker_id', 'first_name last_name')
      .populate('address_id')
      .populate('items.product_id')
      .lean()
      .exec();

    const transformedOrders = orders.map((order) => this.transformOrder(order));

    const users = transformedOrders.map((o) => o.user).filter(Boolean);
    if (users.length > 0) {
      await populateUserRoles(this.roleModel, users as any);
    }

    return transformedOrders;
  }

  async findByUser(userId: string): Promise<any[]> {
    const orders = await this.orderModel
      .find({ user_id: new (Types.ObjectId as any)(userId) })
      .sort({ createdAt: -1 })
      .populate('user_id', '-addresses -password')
      .populate('address_id')
      .populate({
        path: 'items.product_id',
        populate: [
          { path: 'category_id', select: 'name' },
          { path: 'subcategory_id', select: 'name' },
          { path: 'brand_id' },
        ],
      })
      .lean()
      .exec();

    const transformedOrders = orders.map((order) => this.transformOrder(order));

    const users = transformedOrders.map((o) => o.user).filter(Boolean);
    if (users.length > 0) {
      await populateUserRoles(this.roleModel, users);
    }

    return transformedOrders;
  }

  async getOrderStats() {
    const totalOrders = await this.orderModel.countDocuments();

    const monthlyCounts = await this.orderModel.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: '$_id',
          count: 1,
        },
      },
    ]);

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const formattedMonthlyCounts = monthNames.map((monthName, index) => {
      const found = monthlyCounts.find((item) => item.month === index + 1);
      return {
        month: monthName,
        count: found ? found.count : 0,
      };
    });

    return {
      grand_total_orders: totalOrders,
      monthly_counts: formattedMonthlyCounts,
    };
  }

  async getMyPicks(userId: string): Promise<any[]> {
    const orders = await this.orderModel
      .find({ picker_id: new (Types.ObjectId as any)(userId) })
      .sort({ createdAt: -1 })
      .populate('user_id', '-addresses -password')
      .populate('packer_id', 'first_name last_name')
      .populate('picker_id', 'first_name last_name')
      .populate('address_id')
      .populate('items.product_id')
      .lean()
      .exec();

    return orders.map((order) => this.transformOrder(order));
  }

  async getMyPacks(userId: string): Promise<any[]> {
    const orders = await this.orderModel
      .find({ packer_id: new (Types.ObjectId as any)(userId) })
      .sort({ createdAt: -1 })
      .populate('user_id', '-addresses -password')
      .populate('packer_id', 'first_name last_name')
      .populate('picker_id', 'first_name last_name')
      .populate('address_id')
      .populate('items.product_id')
      .lean()
      .exec();

    return orders.map((order) => this.transformOrder(order));
  }
}
