import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class BaseSchema extends Document {
  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ default: true })
  is_active: boolean;
  
  @Prop({ default: false })
  is_deleted: boolean;

  @Prop({ default:'active' })
  status: string;
    
    @Prop({ default:null })
    roles: any[];
}