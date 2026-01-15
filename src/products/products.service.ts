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

    async create(createProductDto: CreateProductDto, files?: Express.Multer.File[]): Promise<ProductDocument> {
        if (files && files.length > 0) {
            createProductDto.images = files.map(file => ({
                url: `/uploads/${file.filename}`
            }));
        }
        const createdProduct = new this.productModel(createProductDto);
        return createdProduct.save();
    }

    // ... findAll and findOne methods unchanged ...

    async update(id: string, updateProductDto: UpdateProductDto, files?: Express.Multer.File[]): Promise<ProductDocument> {
        if (files && files.length > 0) {
            updateProductDto.images = files.map(file => ({
                url: `/uploads/${file.filename}`
            }));
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
