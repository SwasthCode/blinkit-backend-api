import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MainCategoryDocument = MainCategory & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class MainCategory {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  image: string;

  @Prop({ default: 'active' })
  status: string;

  categories?: any[];
}

export const MainCategorySchema = SchemaFactory.createForClass(MainCategory);

MainCategorySchema.virtual('categories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'main_category_id',
});
