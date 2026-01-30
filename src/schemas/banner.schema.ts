import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BannerDocument = Banner & Document;

@Schema({ timestamps: true })
export class Banner {
  @Prop({ required: true })
  image_url: string;

  @Prop({
    required: true,
    enum: ['home_main', 'home_secondary', 'category'],
    default: 'home_main',
  })
  position: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  target_url: string; // e.g., link to a product or category
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
