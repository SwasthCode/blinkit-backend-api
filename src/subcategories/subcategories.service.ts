import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '../common/base/base.service';
import {
  SubCategory,
  SubCategoryDocument,
} from '../schemas/subcategory.schema';
import { UpdateSubCategoryDto } from './dto';

import { FirebaseService } from '../common/firebase/firebase.service';

@Injectable()
export class SubCategoriesService extends BaseService<SubCategoryDocument> {
  constructor(
    @InjectModel(SubCategory.name)
    private subCategoryModel: Model<SubCategoryDocument>,
    private readonly firebaseService: FirebaseService,
  ) {
    super(subCategoryModel);
  }

  // @ts-ignore
  async create(createSubCategoryDto: any, file?: Express.Multer.File): Promise<SubCategoryDocument> {
    if (file) {
      const imageUrl = await this.firebaseService.uploadFile(file, 'subcategories');
      createSubCategoryDto.image = imageUrl;
    }
    return super.create(createSubCategoryDto);
  }

  async update(
    id: string,
    updateSubCategoryDto: UpdateSubCategoryDto,
    file?: Express.Multer.File,
  ): Promise<SubCategoryDocument> {
    if (file) {
      const imageUrl = await this.firebaseService.uploadFile(file, 'subcategories');
      updateSubCategoryDto.image = imageUrl;
    }
    const updated = await this.subCategoryModel
      .findByIdAndUpdate(id, updateSubCategoryDto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`SubCategory with ID ${id} not found`);
    }

    return updated;
  }
}
