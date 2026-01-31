import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '../common/base/base.service';
import {
  MainCategory,
  MainCategoryDocument,
} from '../schemas/main-category.schema';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { UpdateMainCategoryDto } from './dto';

import { FirebaseService } from '../common/firebase/firebase.service';

@Injectable()
export class MainCategoriesService extends BaseService<MainCategoryDocument> {
  constructor(
    @InjectModel(MainCategory.name)
    private mainCategoryModel: Model<MainCategoryDocument>,
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
    private readonly firebaseService: FirebaseService,
  ) {
    super(mainCategoryModel);
    this.searchFields = ['name', 'description', 'status'];
  }

  // @ts-ignore
  async create(
    createMainCategoryDto: any,
    file?: Express.Multer.File,
  ): Promise<MainCategoryDocument> {
    console.log('MainCategoriesService.create - DTO:', createMainCategoryDto);
    console.log(
      'MainCategoriesService.create - File received:',
      file ? file.originalname : 'No file',
    );
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

    const mainCategories = await q.exec();

    // Manually fetch categories for each main category
    const mainCategoryIds = mainCategories.map((mc) => mc.id);
    const allCategories = await this.categoryModel
      .find({
        main_category_id: mainCategoryIds,
      })
      .exec();
    // Map categories to their respective main categories
    const result = mainCategories.map((mc: any) => {
      const mcObj = mc.toObject();
      mcObj.categories = allCategories.filter(
        (c) => c.main_category_id.toString() === mc._id.toString(),
      );
      return mcObj;
    });

    return result as any;
  }

  async findOne(id: string): Promise<MainCategoryDocument> {
    const mainCategory = await this.mainCategoryModel.findById(id).exec();

    if (!mainCategory) {
      throw new NotFoundException(`MainCategory with ID ${id} not found`);
    }

    const categories = await this.categoryModel
      .find({ main_category_id: id })
      .exec();

    const result = mainCategory.toObject();
    result.categories = categories;

    return result as any;
  }

  async update(
    id: string,
    updateMainCategoryDto: UpdateMainCategoryDto,
    file?: Express.Multer.File,
  ): Promise<MainCategoryDocument> {
    console.log('MainCategoriesService.update - ID:', id);
    console.log('MainCategoriesService.update - DTO:', updateMainCategoryDto);
    console.log(
      'MainCategoriesService.update - File received:',
      file ? file.originalname : 'No file',
    );
    if (file) {
      const imageUrl = await this.firebaseService.uploadFile(
        file,
        'main-categories',
      );
      updateMainCategoryDto.image = imageUrl;
    }

    const updatedMainCategory = await this.mainCategoryModel
      .findByIdAndUpdate(id, updateMainCategoryDto, { new: true })
      .exec();

    if (!updatedMainCategory) {
      throw new NotFoundException(`MainCategory with ID ${id} not found`);
    }

    const categories = await this.categoryModel
      .find({ main_category_id: id })
      .exec();

    const result = updatedMainCategory.toObject();
    result.categories = categories;

    return result as any;
  }
}
