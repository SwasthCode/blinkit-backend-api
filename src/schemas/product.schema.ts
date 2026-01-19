import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ _id: true })
export class ProductImage {
  @Prop({ required: true })
  url: string;
}

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

  @Prop({ type: [ProductImage], default: [] })
  images: ProductImage[];

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

// Product JSON :

// { id: '30', name: 'Organic Neem Cake',
//    category: 'Organic',
//    images: [ 'https://as2.ftcdn.net/v2/jpg/07/21/38/09/1000_F_721380940_dXWyVssH6jrWem0QE5ossHrxCFFoPhNv.webp', ],
//     variants: [ { id: 'v1', label: '1 kg', price: 85, originalPrice: 100, discount: '15% off' }, { id: 'v2', label: '5 kg', price: 400, originalPrice: 480, discount: '17% off' }, ], description: 'Organic neem cake fertilizer',
//     countryOfOrigin: 'India',
//     shelfLife: '24 Months', manufacturer: 'Organic Farms India', manufacturerAddress: 'Organic Zone, Bangalore', expiryDate: '10 Oct 2025', inStock: true, },
