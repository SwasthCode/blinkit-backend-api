import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../common/base/base.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User extends BaseSchema {
  @Prop({ required: true })
  first_name: string;

  @Prop({ required: true })
  last_name: string;

  @Prop({ required: true, unique: true })
  phone_number: string;

  @Prop({ required: false, unique: true, sparse: true })
  email?: string;

  @Prop({ required: false })
  password?: string;

  @Prop({ required: false })
  profile_image?: string;

  @Prop({
    required: true,
    default: 'user',
    enum: ['admin', 'user', 'moderator'],
  })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
