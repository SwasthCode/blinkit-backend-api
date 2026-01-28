import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '../common/base/base.service';
import { Address, AddressDocument } from '../schemas/address.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateAddressDto } from './dto';

@Injectable()
export class AddressesService extends BaseService<AddressDocument> {
  constructor(
    @InjectModel(Address.name) private addressModel: Model<AddressDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super(addressModel);
    this.searchFields = ['name', 'shipping_phone', 'pincode', 'locality', 'address', 'city', 'state', 'landmark', 'alternate_phone'];
  }

  async create(
    createAddressDto: any,
  ): Promise<AddressDocument> {
    const userId = createAddressDto.userInfo?._id || createAddressDto.user_id;

    if (createAddressDto.isDefault && userId) {
      await this.addressModel.updateMany(
        { user_id: userId },
        { $set: { isDefault: false } },
      );
    }
    const createdAddress = new this.addressModel(createAddressDto);
    const savedAddress = await createdAddress.save();

    if (userId) {
      await this.userModel.findByIdAndUpdate(userId, {
        $push: { addresses: savedAddress.toObject() },
      });
    }

    return savedAddress;
  }

  async findAllByUser(userId: string): Promise<AddressDocument[]> {
    return this.addressModel.find({ user_id: userId }).exec();
  }



  async remove(id: string): Promise<any> {
    const result = await this.addressModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }
    return result;
  }
}
