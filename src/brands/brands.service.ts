import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '../common/base/base.service';
import { Brand, BrandDocument } from '../schemas/brand.schema';
import { CreateBrandDto } from './dto/create-brand.dto';

import { FirebaseService } from '../common/firebase/firebase.service';
import { CreateBrandDto } from './dto/create-brand.dto';

@Injectable()
export class BrandsService extends BaseService<BrandDocument> {
  constructor(
    @InjectModel(Brand.name) private brandModel: Model<BrandDocument>,
    private readonly firebaseService: FirebaseService,
  ) {
    super(brandModel);
  }

  async create(
    createBrandDto: CreateBrandDto,
    file?: Express.Multer.File,
  ): Promise<BrandDocument> {
    if (file) {
      const imageUrl = await this.firebaseService.uploadFile(file, 'brands');
      createBrandDto.image = imageUrl;
    }
    return super.create(createBrandDto);
  }

  async search(name: string): Promise<BrandDocument[]> {
    return this.brandModel
      .find({
        name: { $regex: name, $options: 'i' },
      })
      .populate('main_category_id', 'name')
      .exec();
  }

  async findByMainCategory(mainCategoryId: string): Promise<BrandDocument[]> {
    return this.brandModel
      .find({ main_category_id: mainCategoryId })
      .populate('main_category_id', 'name')
      .exec();
  }
}
