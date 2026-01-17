import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '../common/base/base.service';
import { Address, AddressDocument } from '../schemas/address.schema';
import { CreateAddressDto } from './dto';

@Injectable()
export class AddressesService extends BaseService<AddressDocument> {
  constructor(
    @InjectModel(Address.name) private addressModel: Model<AddressDocument>,
  ) {
    super(addressModel);
  }

  async create(
    createAddressDto: CreateAddressDto & { user_id: string },
  ): Promise<AddressDocument> {
    if (createAddressDto.isDefault) {
      await this.addressModel.updateMany(
        { user_id: createAddressDto.user_id },
        { $set: { isDefault: false } },
      );
    }
    const createdAddress = new this.addressModel(createAddressDto);
    return createdAddress.save();
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
