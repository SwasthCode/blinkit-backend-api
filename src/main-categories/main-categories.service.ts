import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '../common/base/base.service';
import {
  MainCategory,
  MainCategoryDocument,
} from '../schemas/main-category.schema';
import { UpdateMainCategoryDto } from './dto';

import { FirebaseService } from '../common/firebase/firebase.service';

@Injectable()
export class MainCategoriesService extends BaseService<MainCategoryDocument> {
  constructor(
    @InjectModel(MainCategory.name)
    private mainCategoryModel: Model<MainCategoryDocument>,
    private readonly firebaseService: FirebaseService,
  ) {
    super(mainCategoryModel);
  }

  // @ts-ignore
  async create(
    createMainCategoryDto: any,
    file?: Express.Multer.File,
  ): Promise<MainCategoryDocument> {
    if (file) {
      const imageUrl = await this.firebaseService.uploadFile(
        file,
        'main-categories',
      );
      createMainCategoryDto.image = imageUrl;
    }
    return super.create(createMainCategoryDto);
  }

  async findAll(options: {
    filter?: string;
    select?: string;
    sort?: string;
    limit?: number;
    skip?: number;
  }): Promise<MainCategoryDocument[]> {
    const { filter, select, sort, limit, skip } = options;

    let query = {};
    if (filter) {
      try {
        query = JSON.parse(filter);
      } catch (e) {
        console.warn('Invalid JSON filter in MainCategoriesService:', filter);
      }
    }

    let q = this.mainCategoryModel.find(query);

    if (select) {
      q = q.select(select.split(',').join(' '));
    }

    if (sort) {
      try {
        q = q.sort(JSON.parse(sort));
      } catch (e) {
        q = q.sort(sort);
      }
    }

    if (skip) q = q.skip(Number(skip));
    if (limit) q = q.limit(Number(limit));

    // Explicit deep population
    return q
      .populate({
        path: 'categories',
        model: 'Category',
        populate: {
          path: 'subcategories',
          model: 'SubCategory',
        },
      })
      .exec();
  }

  async findOne(id: string): Promise<MainCategoryDocument> {
    const mainCategory = await this.mainCategoryModel
      .findById(id)
      .populate({
        path: 'categories',
        model: 'Category',
        populate: {
          path: 'subcategories',
          model: 'SubCategory',
        },
      })
      .exec();

    if (!mainCategory) {
      throw new NotFoundException(`MainCategory with ID ${id} not found`);
    }

    return mainCategory;
  }

  async update(
    id: string,
    updateMainCategoryDto: UpdateMainCategoryDto,
    file?: Express.Multer.File,
  ): Promise<MainCategoryDocument> {
    if (file) {
      const imageUrl = await this.firebaseService.uploadFile(
        file,
        'main-categories',
      );
      updateMainCategoryDto.image = imageUrl;
    }

    const updatedMainCategory = await this.mainCategoryModel
      .findByIdAndUpdate(id, updateMainCategoryDto, { new: true })
      .populate({
        path: 'categories',
        populate: {
          path: 'subcategories',
        },
      })
      .exec();

    if (!updatedMainCategory) {
      throw new NotFoundException(`MainCategory with ID ${id} not found`);
    }

    return updatedMainCategory;
  }
}
