import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '../common/base/base.service';
import { MainCategory, MainCategoryDocument } from '../schemas/main-category.schema';
import { UpdateMainCategoryDto } from './dto';

@Injectable()
export class MainCategoriesService extends BaseService<MainCategoryDocument> {
    constructor(
        @InjectModel(MainCategory.name) private mainCategoryModel: Model<MainCategoryDocument>,
    ) {
        super(mainCategoryModel);
    }

    async update(
        id: string,
        updateMainCategoryDto: UpdateMainCategoryDto,
    ): Promise<MainCategoryDocument> {
        const updatedMainCategory = await this.mainCategoryModel
            .findByIdAndUpdate(id, updateMainCategoryDto, { new: true })
            .exec();

        if (!updatedMainCategory) {
            throw new NotFoundException(`MainCategory with ID ${id} not found`);
        }

        return updatedMainCategory;
    }
}
