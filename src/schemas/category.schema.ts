import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  image: string;

  @Prop({ type: Types.ObjectId, ref: 'MainCategory', required: true })
  main_category_id: Types.ObjectId;

  @Prop({ default: 'active' })
  status: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
