import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '../common/base/base.service';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService extends BaseService<CategoryDocument> {
    constructor(
        @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    ) {
        super(categoryModel);
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryDocument> {
        const updatedCategory = await this.categoryModel
            .findByIdAndUpdate(id, updateCategoryDto, { new: true })
            .exec();

        if (!updatedCategory) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        return updatedCategory;
    }
}
