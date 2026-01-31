import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { OrderItem } from './order.schema';

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  order_id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  invoice_number: string; // e.g., INV-1706205600123

  @Prop({ required: true, default: Date.now })
  issued_at: Date;

  @Prop({ type: [Object], required: true })
  items: any[]; // Snapshot of order items

  @Prop({ required: true })
  total_amount: number;

  @Prop({ type: Object, required: true })
  billing_address: any; // Snapshot of address

  @Prop({
    required: true,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
