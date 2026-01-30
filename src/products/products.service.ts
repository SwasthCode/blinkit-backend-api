import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import { BaseService } from '../common/base/base.service';
import { Product, ProductDocument } from '../schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { FirebaseService } from '../common/firebase/firebase.service';
import { generateProductId } from '../common/utils/helper';

@Injectable()
export class ProductsService extends BaseService<ProductDocument> {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly firebaseService: FirebaseService,
  ) {
    super(productModel);
    this.searchFields = ['name', 'description', 'manufacturer', 'manufacturerAddress', 'countryOfOrigin', 'shelfLife'];
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

    const productId = generateProductId();

    const createdProduct = new this.productModel({
      ...createProductDto,
      product_id: productId,
    });
    const saved = await createdProduct.save();
    const populated = await this.productModel
      .findById(saved._id)
      .populate('category_id', 'name')
      .populate('subcategory_id', 'name')
      .populate('brand_id')
      .exec();
    return this.transformProduct(populated);
  }

  async findAll(options: {
    filter?: string;
    select?: string;
    sort?: string;
    limit?: number;
    skip?: number;
  }): Promise<any[]> {
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
      .populate('subcategory_id', 'name')
      .populate('brand_id');

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

    const products = await q.exec();
    return products.map((product) => this.transformProduct(product));
  }

  async findOne(id: string): Promise<any> {
    let doc;
    if (isValidObjectId(id)) {
      doc = await this.productModel
        .findById(id)
        .populate('category_id', 'name')
        .populate('subcategory_id', 'name')
        .populate('brand_id')
        .exec();
    }

    if (!doc) {
      doc = await this.productModel
        .findOne({ product_id: id })
        .populate('category_id', 'name')
        .populate('subcategory_id', 'name')
        .populate('brand_id')
        .exec();
    }

    if (!doc) throw new NotFoundException(`Product not found with ID: ${id}`);
    return this.transformProduct(doc);
  }

  private transformProduct(product: any) {
    const productObj =
      product instanceof Model
        ? product.toObject({ virtuals: false })
        : typeof product.toObject === 'function'
          ? product.toObject({ virtuals: false })
          : product;

    const { category_id, subcategory_id, brand_id, ...rest } = productObj;

    // Ensure populated objects don't have virtual 'id' if they were passed as raw objects
    const category = category_id;
    const subcategory = subcategory_id;
    const brand = brand_id;

    if (category && typeof category === 'object' && 'id' in category) {
      delete (category as any).id;
    }
    if (
      subcategory &&
      typeof subcategory === 'object' &&
      'id' in subcategory
    ) {
      delete (subcategory as any).id;
    }
    if (brand && typeof brand === 'object' && 'id' in brand) {
      delete (brand as any).id;
    }

    return {
      ...rest,
      category,
      subcategory,
      brand,
    };
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    files?: Express.Multer.File[],
  ): Promise<any> {
    if (!isValidObjectId(id)) throw new NotFoundException(`Invalid Product ID format: ${id}`);
    const existingProduct = await this.productModel.findById(id);
    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    let currentImages = existingProduct.images || [];

    if (updateProductDto.removedImageIds && updateProductDto.removedImageIds.length > 0) {
      const removedIds = updateProductDto.removedImageIds;
      currentImages = currentImages.filter(
        (img: any) => !removedIds.includes(img._id.toString()),
      );
      delete updateProductDto.removedImageIds;
    }

    // Handle singular removedImageId if present
    if (updateProductDto.removedImageId) {
      currentImages = currentImages.filter(
        (img: any) => img._id.toString() !== updateProductDto.removedImageId,
      );
      delete updateProductDto.removedImageId;
    }

    if (files && files.length > 0) {
      const uploadPromises = files.map((file) =>
        this.firebaseService.uploadFile(file, 'products'),
      );
      const imageUrls = await Promise.all(uploadPromises);
      const newImages = imageUrls.map((url) => ({ url }));
      currentImages = [...currentImages, ...newImages];
    }

    // Always update images to ensure consistency with our explicit add/remove logic
    updateProductDto.images = currentImages;

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .populate('category_id', 'name')
      .populate('subcategory_id', 'name')
      .populate('brand_id')
      .exec();
    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return this.transformProduct(updatedProduct);
  }

  async remove(id: string): Promise<any> {
    if (!isValidObjectId(id)) throw new NotFoundException(`Invalid Product ID format: ${id}`);
    const deletedProduct = await this.productModel.findByIdAndDelete(id).exec();
    if (!deletedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return deletedProduct;
  }

  async findByCategory(categoryId: string): Promise<any[]> {
    const products = await this.productModel
      .find({ category_id: categoryId })
      .populate('category_id', 'name')
      .populate('subcategory_id', 'name')
      .populate('brand_id')
      .exec();
    return products.map((product) => this.transformProduct(product));
  }

  async findBySubCategory(subCategoryId: string): Promise<any[]> {
    const products = await this.productModel
      .find({ subcategory_id: subCategoryId })
      .populate('category_id', 'name')
      .populate('subcategory_id', 'name')
      .populate('brand_id')
      .exec();
    return products.map((product) => this.transformProduct(product));
  }

  async getRecentProducts(limit: number = 5): Promise<any[]> {
    const products = await this.productModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('category_id', 'name')
      .populate('subcategory_id', 'name')
      .populate('brand_id')
      .exec();
    return products.map((product) => this.transformProduct(product));
  }

  async decreaseStock(productId: string, quantity: number): Promise<void> {
    const result = await this.productModel.updateOne(
      { _id: productId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } }
    ).exec();

    if (result.modifiedCount === 0) {
      const product = await this.productModel.findById(productId);
      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }
      throw new BadRequestException(`Insufficient stock for product: ${product.name}`);
    }
  }

  async increaseStock(productId: string, quantity: number): Promise<void> {
    await this.productModel.updateOne(
      { _id: productId },
      { $inc: { stock: quantity } }
    ).exec();
  }
}
