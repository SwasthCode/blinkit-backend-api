import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ShiftDocument = Shift & Document;

@Schema({ timestamps: true })
export class Shift {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user_id: Types.ObjectId;

    @Prop({ required: true })
    start_time: Date;

    @Prop({ required: true })
    end_time: Date;

    @Prop({ required: true, default: 'active', enum: ['active', 'inactive'] })
    status: string;
}

export const ShiftSchema = SchemaFactory.createForClass(Shift);
