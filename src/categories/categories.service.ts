import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '../common/base/base.service';
import { Category, CategoryDocument } from '../schemas/category.schema';
import {
  MainCategory,
  MainCategoryDocument,
} from '../schemas/main-category.schema';
import { UpdateCategoryDto } from './dto';

import { FirebaseService } from '../common/firebase/firebase.service';

@Injectable()
export class CategoriesService extends BaseService<CategoryDocument> {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(MainCategory.name)
    private mainCategoryModel: Model<MainCategoryDocument>,
    private readonly firebaseService: FirebaseService,
  ) {
    super(categoryModel);
  }

  async create(
    createCategoryDto: any,
    file?: Express.Multer.File,
  ): Promise<CategoryDocument> {
    const { main_category_id } = createCategoryDto;
    const mainCategory =
      await this.mainCategoryModel.findById(main_category_id);
    if (!mainCategory) {
      throw new NotFoundException(
        `Main Category with ID ${main_category_id} not found`,
      );
    }

    if (file) {
      const imageUrl = await this.firebaseService.uploadFile(
        file,
        'categories',
      );
      createCategoryDto.image = imageUrl;
    }

    return super.create(createCategoryDto);
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    file?: Express.Multer.File,
  ): Promise<CategoryDocument> {
    if (file) {
      const imageUrl = await this.firebaseService.uploadFile(
        file,
        'categories',
      );
      updateCategoryDto.image = imageUrl;
    }

    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();

    if (!updatedCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return updatedCategory;
  }
}
