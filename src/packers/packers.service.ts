import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '../common/base/base.service';
import { Packer, PackerDocument } from '../schemas/packer.schema';

@Injectable()
export class PackersService extends BaseService<PackerDocument> {
  constructor(
    @InjectModel(Packer.name) private packerModel: Model<PackerDocument>,
  ) {
    super(packerModel);
  }
}
