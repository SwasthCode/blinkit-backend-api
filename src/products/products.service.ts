import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '../common/base/base.service';
import { Product, ProductDocument } from '../schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { FirebaseService } from '../common/firebase/firebase.service';

@Injectable()
export class ProductsService extends BaseService<ProductDocument> {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly firebaseService: FirebaseService,
  ) {
    super(productModel);
  }

  async create(
    createProductDto: CreateProductDto,
    files?: Express.Multer.File[],
  ): Promise<ProductDocument> {
    if (files && files.length > 0) {
      const uploadPromises = files.map((file) =>
        this.firebaseService.uploadFile(file, 'products'),
      );
      const imageUrls = await Promise.all(uploadPromises);
      createProductDto.images = imageUrls.map((url) => ({ url }));
    }
    const createdProduct = new this.productModel(createProductDto);
    return createdProduct.save();
  }

  async findAll(options: {
    filter?: string;
    select?: string;
    sort?: string;
    limit?: number;
    skip?: number;
  }): Promise<ProductDocument[]> {
    const { filter, select, sort, limit, skip } = options;

    let query = {};
    if (filter) {
      try {
        query = JSON.parse(filter);
      } catch (e) {
        console.warn('Invalid JSON filter:', filter);
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

    let q = this.productModel
      .find(query)
      .populate('category_id', 'name')
      .populate('subcategory_id', 'name');

    if (select) {
      q = q.select(select.split(',').join(' '));
    }

    if (sortOptions) {
      q = q.sort(sortOptions);
    }

    if (skip) {
      q = q.skip(Number(skip));
    }

    if (limit) {
      q = q.limit(Number(limit));
    }

    return q.exec();
  }

  async findOne(id: string): Promise<ProductDocument> {
    const doc = await this.productModel
      .findById(id)
      .populate('category_id', 'name')
      .populate('subcategory_id', 'name')
      .exec();
    if (!doc) throw new NotFoundException(`Product not found with ID: ${id}`);
    return doc;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    files?: Express.Multer.File[],
  ): Promise<ProductDocument> {
    if (files && files.length > 0) {
      const uploadPromises = files.map((file) =>
        this.firebaseService.uploadFile(file, 'products'),
      );
      const imageUrls = await Promise.all(uploadPromises);
      updateProductDto.images = imageUrls.map((url) => ({ url }));
    }
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .exec();
    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return updatedProduct;
  }

  async remove(id: string): Promise<any> {
    const deletedProduct = await this.productModel.findByIdAndDelete(id).exec();
    if (!deletedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return deletedProduct;
  }

  async findByCategory(categoryId: string): Promise<ProductDocument[]> {
    return this.productModel
      .find({ category_id: categoryId })
      .populate('category_id', 'name')
      .populate('subcategory_id', 'name')
      .exec();
  }

  async findBySubCategory(subCategoryId: string): Promise<ProductDocument[]> {
    return this.productModel
      .find({ subcategory_id: subCategoryId })
      .populate('category_id', 'name')
      .populate('subcategory_id', 'name')
      .exec();
  }

  async getRecentProducts(limit: number = 5): Promise<ProductDocument[]> {
    return this.productModel.find().sort({ createdAt: -1 }).limit(limit).exec();
  }
}
