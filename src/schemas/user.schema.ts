import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../common/base/base.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User extends BaseSchema {
  @Prop({ required: false })
  first_name: string;

  @Prop({ required: false })
  last_name: string;

  @Prop({ required: true, unique: true })
  phone_number: string;

  @Prop({ required: false, unique: true, sparse: true })
  email?: string;

  // @Prop({ required: false })
  // password?: string;

  @Prop({
    required: true,
    type: [],
    // default: 'user',
    // enum: ['admin', 'user', 'moderator'],
  })
  role: [];
}

export const UserSchema = SchemaFactory.createForClass(User);
