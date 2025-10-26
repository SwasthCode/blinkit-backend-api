import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../common/base/base.schema';

export type RoleDocument = HydratedDocument<Role>;

@Schema({ timestamps: true })
export class Role extends BaseSchema {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true })
  role_type: number;

  @Prop({ required: true, unique: true })
  role_id: number;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

// Transform to remove is_deleted and roles from JSON response
RoleSchema.set('toJSON', {
  transform: function(doc, ret: Record<string, any>) {
    delete ret.is_deleted;
    delete ret.roles;
    return ret;
  }
});

