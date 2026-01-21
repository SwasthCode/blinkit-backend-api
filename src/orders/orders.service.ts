import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseService } from '../common/base/base.service';
import { Order, OrderDocument, OrderItem } from '../schemas/order.schema';
import { CartService } from '../cart/cart.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateDirectOrderDto } from './dto/create-direct-order.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService extends BaseService<OrderDocument> {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
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
  ): Promise<OrderDocument> {
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
          product.images?.[0]?.url,
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
      status: 'Pending',
      payment_status: 'Pending',
    });

    return order.save();
  }

  async updateStatus(id: string, status: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    order.status = status;
    return order.save();
  }

  async findOne(id: string): Promise<any> {
    const order = await this.orderModel
      .findById(id)
      .populate('user_id', '-addresses -password')
      .populate('address_id')
      .populate('items.product_id')
      .exec();

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.transformOrder(order);
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

  async findByUser(userId: string): Promise<any[]> {
    const orders = await this.orderModel
      .find({ user_id: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .populate('user_id', '-addresses -password')
      .populate('address_id')
      .populate('items.product_id')
      .exec();

    // Transform logic
    return orders.map((order) => this.transformOrder(order));
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
