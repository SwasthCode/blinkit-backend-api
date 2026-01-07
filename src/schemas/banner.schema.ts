import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../common/base/base.schema';

export type BannerDocument = HydratedDocument<Banner>;

@Schema({ timestamps: true })
export class Banner extends BaseSchema {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    image_url: string;

    @Prop({ required: false })
    link_url?: string;

    @Prop({
        required: true,
        default: 'active',
        enum: ['active', 'inactive'],
    })
    declare status: string;

    @Prop({ required: false, default: 0 })
    priority: number;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
