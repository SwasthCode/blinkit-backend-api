import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '../common/base/base.service';
import { SubCategory, SubCategoryDocument } from '../schemas/subcategory.schema';
import { UpdateSubCategoryDto } from './dto';

@Injectable()
export class SubCategoriesService extends BaseService<SubCategoryDocument> {
    constructor(
        @InjectModel(SubCategory.name) private subCategoryModel: Model<SubCategoryDocument>,
    ) {
        super(subCategoryModel);
    }

    async update(id: string, updateSubCategoryDto: UpdateSubCategoryDto): Promise<SubCategoryDocument> {
        const updated = await this.subCategoryModel
            .findByIdAndUpdate(id, updateSubCategoryDto, { new: true })
            .exec();

        if (!updated) {
            throw new NotFoundException(`SubCategory with ID ${id} not found`);
        }

        return updated;
    }
}
