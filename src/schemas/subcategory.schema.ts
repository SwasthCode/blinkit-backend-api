import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SubCategoryDocument = SubCategory & Document;

@Schema({ timestamps: true })
export class SubCategory {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  image: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category_id: Types.ObjectId;

  // @Prop({ enum: ['active', 'inactive'], default: 'active' })
  // status: string;
}

export const SubCategorySchema = SchemaFactory.createForClass(SubCategory);
