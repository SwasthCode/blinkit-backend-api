import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '../common/base/base.service';
import { Product, ProductDocument } from '../schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService extends BaseService<ProductDocument> {
    constructor(
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    ) {
        super(productModel);
    }

    async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
        const createdProduct = new this.productModel(createProductDto);
        return createdProduct.save();
    }

    async findAll(options: {
        filter?: string;
        select?: string;
        sort?: string;
        limit?: number;
        skip?: number;
    } = {}): Promise<ProductDocument[]> {
        const { filter, select, sort, limit, skip } = options;

        let query = {};
        if (filter) {
            try {
                query = JSON.parse(filter);
            } catch (e) {
                console.warn('Invalid JSON filter:', filter);
            }
        }

        let q = this.productModel.find(query);

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

        if (skip) {
            q = q.skip(Number(skip));
        }

        if (limit) {
            q = q.limit(Number(limit));
        }

        return q
            .populate('category_id')
            .populate('subcategory_id')
            .exec();
    }

    async findOne(id: string): Promise<ProductDocument> {
        const product = await this.productModel
            .findById(id)
            .populate('category_id')
            .populate('subcategory_id')
            .exec();
        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }
        return product;
    }

    async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductDocument> {
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
            .populate('category_id')
            .populate('subcategory_id')
            .exec();
    }

    async findBySubCategory(subCategoryId: string): Promise<ProductDocument[]> {
        return this.productModel
            .find({ subcategory_id: subCategoryId })
            .populate('category_id')
            .populate('subcategory_id')
            .exec();
    }
}
