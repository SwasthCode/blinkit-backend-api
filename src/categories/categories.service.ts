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

    const created = await super.create(createCategoryDto);
    const populated = await this.categoryModel
      .findById(created._id)
      .populate('main_category_id', 'name')
      .populate('brand_id')
      .exec();
    return this.transformCategory(populated);
  }

  async findAll(options: any): Promise<any[]> {
    const { filter, select, sort, limit, skip } = options;
    let query = {};
    if (filter) {
      try {
        query = JSON.parse(filter);
      } catch (e) {}
    }

    const q = this.categoryModel
      .find(query)
      .populate('main_category_id', 'name')
      .populate('brand_id');

    if (sort) q.sort(sort);
    if (skip) q.skip(Number(skip));
    if (limit) q.limit(Number(limit));
    if (select) q.select(select);

    const data = await q.exec();
    return data.map((item) => this.transformCategory(item));
  }

  async findOne(id: string): Promise<any> {
    const data = await this.categoryModel
      .findById(id)
      .populate('main_category_id', 'name')
      .populate('brand_id')
      .exec();
    if (!data) throw new NotFoundException(`Category not found`);
    return this.transformCategory(data);
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    file?: Express.Multer.File,
  ): Promise<any> {
    if (file) {
      const imageUrl = await this.firebaseService.uploadFile(
        file,
        'categories',
      );
      updateCategoryDto.image = imageUrl;
    }

    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .populate('main_category_id', 'name')
      .populate('brand_id')
      .exec();

    if (!updatedCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return this.transformCategory(updatedCategory);
  }

  private transformCategory(item: any) {
    const obj =
      item instanceof Model ? item.toObject({ virtuals: false }) : item;
    const { main_category_id, brand_id, ...rest } = obj;

    const mainCategory = main_category_id;
    const brand = brand_id;

    if (mainCategory && typeof mainCategory === 'object' && 'id' in mainCategory) {
      delete (mainCategory as any).id;
    }
    if (brand && typeof brand === 'object' && 'id' in brand) {
      delete (brand as any).id;
    }

    return {
      ...rest,
      mainCategory,
      brand,
    };
  }
}
