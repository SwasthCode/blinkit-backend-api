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
    this.searchFields = ['name', 'description', 'status'];
  }

  // @ts-ignore
  async create(
    createSubCategoryDto: any,
    file?: Express.Multer.File,
  ): Promise<SubCategoryDocument> {
    if (file) {
      const imageUrl = await this.firebaseService.uploadFile(
        file,
        'subcategories',
      );
      createSubCategoryDto.image = imageUrl;
    }
    const created = await super.create(createSubCategoryDto);
    const populated = await this.subCategoryModel
      .findById(created._id)
      .populate('category_id', 'name')
      .populate('brand_id')
      .exec();
    return this.transformSubCategory(populated);
  }

  async findAll(options: any): Promise<any[]> {
    const { filter, select, sort, limit, skip } = options;
    let query = {};
    if (filter) {
      try {
        query = JSON.parse(filter);
      } catch (e) { }
    }

    const q = this.subCategoryModel
      .find(query)
      .populate('category_id', 'name')
      .populate('brand_id');

    let sortOptions: any = {};
    if (sort) {
      try {
        sortOptions = JSON.parse(sort);
      } catch (e) {
        sortOptions = sort;
      }
    }

    if (sortOptions) q.sort(sortOptions);
    if (skip) q.skip(Number(skip));
    if (limit) q.limit(Number(limit));
    if (select) q.select(select);

    const data = await q.exec();
    return data.map((item) => this.transformSubCategory(item));
  }

  async findOne(id: string): Promise<any> {
    const data = await this.subCategoryModel
      .findById(id)
      .populate('category_id', 'name')
      .populate('brand_id')
      .exec();
    if (!data) throw new NotFoundException(`SubCategory not found`);
    return this.transformSubCategory(data);
  }

  async update(
    id: string,
    updateSubCategoryDto: UpdateSubCategoryDto,
    file?: Express.Multer.File,
  ): Promise<any> {
    if (file) {
      const imageUrl = await this.firebaseService.uploadFile(
        file,
        'subcategories',
      );
      updateSubCategoryDto.image = imageUrl;
    }
    const updated = await this.subCategoryModel
      .findByIdAndUpdate(id, updateSubCategoryDto, { new: true })
      .populate('category_id', 'name')
      .populate('brand_id')
      .exec();

    if (!updated) {
      throw new NotFoundException(`SubCategory with ID ${id} not found`);
    }

    return this.transformSubCategory(updated);
  }

  private transformSubCategory(item: any) {
    const obj =
      item instanceof Model ? item.toObject({ virtuals: false }) : item;
    const { category_id, brand_id, ...rest } = obj;

    const category = category_id;
    const brand = brand_id;

    if (category && typeof category === 'object' && 'id' in category) {
      delete (category as any).id;
    }
    if (brand && typeof brand === 'object' && 'id' in brand) {
      delete (brand as any).id;
    }

    return {
      ...rest,
      category,
      brand,
    };
  }
}
