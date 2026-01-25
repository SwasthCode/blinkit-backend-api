
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseService } from '../common/base/base.service';
import { Invoice, InvoiceDocument } from '../schemas/invoice.schema';
import { Order, OrderDocument } from '../schemas/order.schema';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto';

@Injectable()
export class InvoicesService extends BaseService<InvoiceDocument> {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {
    super(invoiceModel);
  }

  async create(createInvoiceDto: CreateInvoiceDto): Promise<InvoiceDocument> {
    const { order_id } = createInvoiceDto;

    // Check if order exists
    const order = await this.orderModel
      .findById(order_id)
      .populate('user_id')
      .populate('address_id')
      .lean()
      .exec() as any;

    if (!order) {
      throw new NotFoundException(`Order with ID ${order_id} not found`);
    }

    // Check if invoice already exists for this order
    const existingInvoice = await this.invoiceModel
      .findOne({ order_id: new Types.ObjectId(order_id) })
      .exec();

    if (existingInvoice) {
      throw new BadRequestException(
        `Invoice already exists for order ${order_id}`,
      );
    }

    // Generate Invoice Data from Order
    const invoiceData = {
      order_id: new Types.ObjectId(order_id),
      user_id: order.user_id._id,
      invoice_number: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      issued_at: new Date(),
      items: order.items,
      total_amount: order.total_amount,
      billing_address: order.address_id, // Assuming shipping address is billing address for now
      status: createInvoiceDto.status || 'pending',
    };

    const createdInvoice = new this.invoiceModel(invoiceData);
    return createdInvoice.save();
  }

  async findByOrder(orderId: string): Promise<InvoiceDocument> {
    const invoice = await this.invoiceModel
      .findOne({ order_id: new Types.ObjectId(orderId) })
      .populate('user_id', 'first_name last_name email phone_number')
      .exec();

    if (!invoice) {
        // Option: Auto-generate if not found? 
        // For now, request via POST to create explicitly.
      throw new NotFoundException(`Invoice not found for order ${orderId}`);
    }
    return invoice;
  }

  async findAll(options: any = {}): Promise<InvoiceDocument[]> {
      // Basic override if needed or rely on base, but we might want to populate user
      const { filter, sort, limit, skip } = options;
      // ... reuse base logic or custom query
      return super.findAll(options);
  }
}
