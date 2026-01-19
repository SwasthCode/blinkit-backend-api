import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '../common/base/base.service';
import { MainCategory, MainCategoryDocument } from '../schemas/main-category.schema';
import { UpdateMainCategoryDto } from './dto';

import { FirebaseService } from '../common/firebase/firebase.service';

@Injectable()
export class MainCategoriesService extends BaseService<MainCategoryDocument> {
    constructor(
        @InjectModel(MainCategory.name) private mainCategoryModel: Model<MainCategoryDocument>,
        private readonly firebaseService: FirebaseService,
    ) {
        super(mainCategoryModel);
    }

    // @ts-ignore
    async create(createMainCategoryDto: any, file?: Express.Multer.File): Promise<MainCategoryDocument> {
        if (file) {
            const imageUrl = await this.firebaseService.uploadFile(file, 'main-categories');
            createMainCategoryDto.image = imageUrl;
        }
        return super.create(createMainCategoryDto);
    }

    async update(
        id: string,
        updateMainCategoryDto: UpdateMainCategoryDto,
        file?: Express.Multer.File,
    ): Promise<MainCategoryDocument> {
        if (file) {
            const imageUrl = await this.firebaseService.uploadFile(file, 'main-categories');
            updateMainCategoryDto.image = imageUrl;
        }

        const updatedMainCategory = await this.mainCategoryModel
            .findByIdAndUpdate(id, updateMainCategoryDto, { new: true })
            .exec();

        if (!updatedMainCategory) {
            throw new NotFoundException(`MainCategory with ID ${id} not found`);
        }

        return updatedMainCategory;
    }
}
