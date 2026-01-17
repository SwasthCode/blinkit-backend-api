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
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Address', required: true })
  address_id: Types.ObjectId;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop({ required: true })
  total_amount: number;

  @Prop({
    required: true,
    enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  })
  status: string;

  @Prop({
    required: true,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending',
  })
  payment_status: string;

  @Prop()
  payment_method: string; // COD, Online, etc.
}

export const OrderSchema = SchemaFactory.createForClass(Order);
