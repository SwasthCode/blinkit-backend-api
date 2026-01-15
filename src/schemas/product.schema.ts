import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
    @Prop({ required: true })
    name: string;

    @Prop()
    description: string;

    @Prop({ required: true })
    price: number;

    @Prop({ required: true })
    mrp: number;

    @Prop({ required: true })
    unit: string;

    @Prop()
    image: string;

    @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
    category_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'SubCategory', required: true })
    subcategory_id: Types.ObjectId;

    @Prop({ default: 0 })
    stock: number;

    @Prop({ default: true })
    isAvailable: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
