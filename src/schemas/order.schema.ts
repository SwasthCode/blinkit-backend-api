import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema()
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product_id: Types.ObjectId;

  @Prop({ required: true })
  name: string; // Snapshot of product name

  @Prop({ required: true })
  image: string; // Snapshot of product image

  @Prop({ required: true })
  price: number; // Snapshot of price at time of order

  @Prop({ required: true })
  quantity: number;

  @Prop()
  brand_name?: string;
}

@Schema()
export class WorkerAssignment {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop()
  name: string;

  @Prop()
  phone: string;

  @Prop({ default: 'pending' })
  status: string;

  @Prop()
  accepted_at?: Date;

  @Prop()
  updated_at?: Date;

  @Prop()
  remark_msg?: string;

  @Prop({
    type: [
      {
        status: { type: String },
        changedAt: { type: Date, default: Date.now },
        comment: { type: String },
      },
    ],
    default: [],
  })
  status_history: {
    status: string;
    changedAt: Date;
    comment?: string;
  }[];
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ unique: true, required: true })
  order_id: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Address', required: true })
  address_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  packer_id?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  picker_id?: Types.ObjectId;
  @Prop({ default: false })
  picker_accepted?: boolean;
  @Prop()
  picker_remark?: string;
  @Prop()
  packer_remark?: string;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop({ required: true })
  total_amount: number;

  @Prop()
  shipping_address?: string;

  @Prop()
  shipping_phone?: string;

  @Prop()
  customer_name?: string;

  @Prop({
    type: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        comment: { type: String },
      },
    ],
    default: [],
  })
  status_history: {
    status: string;
    changedAt: Date;
    comment?: string;
  }[];

  @Prop({
    required: true,
    enum: [
      'pending',
      'confirmed',
      'ready',
      'hold',
      'ship',
      'shipped',
      'delivered',
      'cancelled',
      'returned',
    ],
    default: 'pending',
  })
  status: string;

  @Prop({
    required: true,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  })
  payment_status: string;

  @Prop()
  payment_method: string; // COD, Online, etc.

  @Prop({ type: Object })
  payment_details: any;

  @Prop()
  order_remark?: string;

  @Prop({ type: WorkerAssignment })
  picker_obj?: WorkerAssignment;

  @Prop({ type: WorkerAssignment })
  packer_obj?: WorkerAssignment;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
