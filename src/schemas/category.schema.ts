import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
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

  @Prop({ type: Types.ObjectId, ref: 'Brand' })
  brand_id: Types.ObjectId;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.virtual('subcategories', {
  ref: 'SubCategory',
  localField: '_id',
  foreignField: 'category_id',
});
