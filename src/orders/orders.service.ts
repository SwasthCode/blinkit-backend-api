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

@Injectable()
export class OrdersService extends BaseService<OrderDocument> {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly cartService: CartService,
  ) {
    super(orderModel);
  }

  async placeOrder(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<OrderDocument> {
    // 1. Get User's Cart
    const cart = await this.cartService.getCart(userId);
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // 2. Calculate Total & Prepare Order Items (Snapshot)
    let totalAmount = 0;
    const orderItems: OrderItem[] = [];

    for (const item of cart.items) {
      const product = item.product_id as any; // Populated in getCart
      if (!product) continue;

      totalAmount += product.price * item.quantity;
      orderItems.push({
        product_id: product._id,
        name: product.name,
        image:
          product.images?.[0]?.url ||
          'https://placehold.co/600x400?text=No+Image',
        price: product.price,
        quantity: item.quantity,
      });
    }

    // 3. Create Order
    const order = new this.orderModel({
      user_id: new Types.ObjectId(userId),
      address_id: new Types.ObjectId(createOrderDto.address_id),
      items: orderItems,
      total_amount: totalAmount,
      payment_method: createOrderDto.payment_method || 'COD',
      status: 'Pending',
      payment_status: 'Pending',
    });

    const savedOrder = await order.save();

    // 4. Clear Cart
    await this.cartService.clearCart(userId);

    return savedOrder;
  }

  async findByUser(userId: string): Promise<OrderDocument[]> {
    return this.orderModel
      .find({ user_id: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .populate('items.product_id') // Optional: populate if needed, but snapshot data is in items
      .exec();
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
