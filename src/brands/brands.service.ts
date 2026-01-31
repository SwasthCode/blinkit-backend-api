import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '../common/base/base.service';
import { Brand, BrandDocument } from '../schemas/brand.schema';
import { CreateBrandDto } from './dto/create-brand.dto';

import { FirebaseService } from '../common/firebase/firebase.service';

@Injectable()
export class BrandsService extends BaseService<BrandDocument> {
  constructor(
    @InjectModel(Brand.name) private brandModel: Model<BrandDocument>,
    private readonly firebaseService: FirebaseService,
  ) {
    super(brandModel);
    this.searchFields = ['name', 'status'];
  }

  async create(
    createBrandDto: CreateBrandDto,
    file?: Express.Multer.File,
  ): Promise<any> {
    if (file) {
      const imageUrl = await this.firebaseService.uploadFile(file, 'brands');
      createBrandDto.image = imageUrl;
    }
    const created = await super.create(createBrandDto);
    return this.findOne((created as any)._id.toString());
  }

  async findAll(options: any = {}): Promise<any[]> {
    const { filter, select, sort, limit, skip } = options;
    let query = {};
    if (filter) {
      try {
        query = JSON.parse(filter);
      } catch (e) {
        console.warn('Invalid JSON filter in BrandsService:', filter);
      }
    }

    let sortOptions: any = {};
    if (sort) {
      try {
        sortOptions = JSON.parse(sort);
      } catch (e) {
        sortOptions = sort;
      }
    }

    const q = this.brandModel
      .find(query)
      .populate('main_category_id', 'name image');

    if (select) q.select(select.split(/[,\s]+/).join(' '));
    if (sortOptions) q.sort(sortOptions);
    if (skip) q.skip(Number(skip));
    if (limit) q.limit(Number(limit));

    const brands = await q.lean().exec();
    return brands.map((brand: any) => this.transformBrand(brand));
  }

  async findOne(id: string): Promise<any> {
    const brand = await this.brandModel
      .findById(id)
      .populate('main_category_id', 'name image')
      .exec();
    if (!brand) throw new NotFoundException(`Brand with ID ${id} not found`);
    return this.transformBrand(brand);
  }

  async search(name: string): Promise<any[]> {
    const brands = await this.brandModel
      .find({
        name: { $regex: name, $options: 'i' },
      })
      .populate('main_category_id', 'name image')
      .exec();
    return brands.map((brand) => this.transformBrand(brand));
  }

  async findByMainCategory(mainCategoryId: string): Promise<any[]> {
    const brands = await this.brandModel
      .find({ main_category_id: mainCategoryId })
      .populate('main_category_id', 'name image')
      .exec();
    return brands.map((brand) => this.transformBrand(brand));
  }

  async update(
    id: string,
    updateBrandDto: any,
    file?: Express.Multer.File,
  ): Promise<any> {
    if (file) {
      const imageUrl = await this.firebaseService.uploadFile(file, 'brands');
      updateBrandDto.image = imageUrl;
    }
    await super.update(id, updateBrandDto);
    return this.findOne(id);
  }

  private transformBrand(brand: any) {
    // Handle both Mongoose documents and plain objects (from lean)
    const brandObj =
      typeof brand.toObject === 'function'
        ? brand.toObject({ virtuals: true })
        : brand;

    const { main_category_id, ...rest } = brandObj;

    return {
      ...rest,
      mainCategory: main_category_id || null,
    };
  }
}
