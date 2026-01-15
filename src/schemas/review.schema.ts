import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ _id: true })
export class ReviewImage {
    @Prop({ required: true })
    url: string;
}

@Schema({ timestamps: true })
export class Review {
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    product_id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user_id: Types.ObjectId;

    @Prop({ required: true, min: 1, max: 5 })
    rating: number;

    @Prop()
    comment: string;

    @Prop({ type: [ReviewImage], default: [] })
    images: ReviewImage[];
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
