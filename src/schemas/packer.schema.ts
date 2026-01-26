import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseSchema } from '../common/base/base.schema';

export type PackerDocument = Packer & Document;

@Schema({ timestamps: true })
export class Packer extends BaseSchema {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ required: false, unique: true, sparse: true })
  email?: string;

  @Prop({ required: true, default: 'active', enum: ['active', 'inactive'] })
  declare status: string;

  @Prop({ required: false })
  address?: string;

  @Prop({ default: true })
  is_available: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  user_id?: Types.ObjectId; // Link to user account if needed
}

export const PackerSchema = SchemaFactory.createForClass(Packer);
