import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BrandDocument = Brand & Document;

@Schema({ timestamps: true })
export class Brand {
  @Prop({ required: true, unique: true, index: true })
  name: string;

  @Prop()
  image: string;

  @Prop({ type: Types.ObjectId, ref: 'MainCategory', required: true })
  main_category_id: Types.ObjectId;

  @Prop({ default: 'active' })
  status: string;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);
