import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MainCategoryDocument = MainCategory & Document;

@Schema({ timestamps: true })
export class MainCategory {
    @Prop({ required: true })
    name: string;

    @Prop()
    description: string;

    @Prop()
    image: string;

    @Prop({ default: 'active' })
    status: string;
}

export const MainCategorySchema = SchemaFactory.createForClass(MainCategory);
