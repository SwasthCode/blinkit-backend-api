import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto, UpdateUserDto } from './dto';
import { BaseService } from '../common/base/base.service';

@Injectable()
export class UsersService extends BaseService<UserDocument> {
  constructor(@InjectModel(User.name) userModel: Model<UserDocument>) {
    super(userModel);
  }

  // Additional user-specific methods can be added here
  // The basic CRUD operations are inherited from BaseService
}
