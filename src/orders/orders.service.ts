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
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateDirectOrderDto } from './dto/create-direct-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

import { ProductsService } from '../products/products.service';
import { populateUserRoles } from '../common/utils/rolePopulat.util';

@Injectable()
export class OrdersService extends BaseService<OrderDocument> {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    private readonly cartService: CartService,
    private readonly productsService: ProductsService,
  ) {
    super(orderModel);
  }

  // async placeOrder(
  //   userId: string,
  //   createOrderDto: CreateOrderDto,
  // ): Promise<OrderDocument> {
  //   // 1. Get User's Cart
  //   const cart = await this.cartService.getCart(userId);
  //   if (!cart || !cart.items || cart.items.length === 0) {
  //     throw new BadRequestException('Cart is empty');
  //   }

  //   // 2. Calculate Total & Prepare Order Items (Snapshot)
  //   let totalAmount = 0;
  //   const orderItems: OrderItem[] = [];

  //   for (const item of cart.items) {
  //     const product = item.product_id as any; // Populated in getCart
  //     if (!product) continue;

  //     totalAmount += product.price * item.quantity;
  //     orderItems.push({
  //       product_id: product._id,
  //       name: product.name,
  //       image:
  //         product.images?.[0]?.url ||
  //         'https://placehold.co/600x400?text=No+Image',
  //       price: product.price,
  //       quantity: item.quantity,
  //     });
  //   }

  //   // 3. Create Order
  //   const order = new this.orderModel({
  //     user_id: new Types.ObjectId(userId),
  //     address_id: new Types.ObjectId(createOrderDto.address_id),
  //     items: orderItems,
  //     total_amount: totalAmount,
  //     payment_method: createOrderDto.payment_method || 'COD',
  //     status: 'Pending',
  //     payment_status: 'Pending',
  //   });

  //   const savedOrder = await order.save();

  //   // 4. Clear Cart
  //   await this.cartService.clearCart(userId);

  //   return savedOrder;
  // }

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
        image:
          product.images?.[0]?.url || 'https://placehold.co/100',
        price: product.price,
        quantity: item.quantity,
      });

      totalAmount += product.price * item.quantity;
    }

    const order = new this.orderModel({
      user_id: new Types.ObjectId(userId),
      address_id: new Types.ObjectId(createDirectOrderDto.address_id),
      items: orderItems,
      total_amount: totalAmount,
      payment_method: createDirectOrderDto.payment_method || 'COD',
      status: 'pending',
      payment_status: 'pending',
      status_history: [
        {
          status: 'pending',
          changedAt: new Date(),
          comment: 'Order placed',
        },
      ],
    });

    const savedOrder = await order.save();
    return this.findOne((savedOrder as any)._id.toString());
  }

  async updateOrder(id: string, updateOrderDto: UpdateOrderStatusDto): Promise<any> {
    const order = await this.orderModel.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const restrictedStatuses = ['shipped', 'delivered', 'returned', 'cancelled'];
    const isRestricted = restrictedStatuses.includes(order.status.toLowerCase());

    if (isRestricted) {
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

    if (updateOrderDto.items) {
      order.items = updateOrderDto.items.map((item: any) => ({
        product_id: new Types.ObjectId(item.product_id),
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

    if (updateOrderDto.status) {
      const newStatus = updateOrderDto.status.toLowerCase();
      if (order.status !== newStatus) {
        order.status = newStatus;
        order.status_history.push({
          status: newStatus,
          changedAt: new Date(),
          comment: `Status updated to ${newStatus}`,
        });
      }
    }

    if (updateOrderDto.shipping_address) {
      order.shipping_address = updateOrderDto.shipping_address;
    }
    if (updateOrderDto.shipping_phone) {
      order.shipping_phone = updateOrderDto.shipping_phone;
    }
    if (updateOrderDto.customer_name) {
      order.customer_name = updateOrderDto.customer_name;
    }
    if (updateOrderDto.address_id) {
      order.address_id = new Types.ObjectId(updateOrderDto.address_id);
    }

    await order.save();
    return this.findOne(id);
  }

  async findOne(id: string): Promise<any> {
    const order = await this.orderModel
      .findById(id)
      .populate('user_id', '-addresses -password')
      .populate('address_id')
      .populate('items.product_id')
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

    // Remove 'id' if still present in populated objects
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

        return {
          ...productObj,
          quantity: item.quantity,
        };
      }
      return item;
    });

    return {
      ...rest,
      user,
      address,
      items,
    };
  }

  async findAll(options: {
    filter?: string;
    select?: string;
    sort?: string;
    limit?: number;
    skip?: number;
  }): Promise<any[]> {
    const { filter, select, sort, limit, skip } = options;
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
      .find({ user_id: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .populate('user_id', '-addresses -password')
      .populate('address_id')
      .populate('items.product_id')
      .lean()
      .exec();

    // Transform logic
    const transformedOrders = orders.map((order) => this.transformOrder(order));

    // Populate user roles on the transformed objects
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

    // Map month numbers to names
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
}
