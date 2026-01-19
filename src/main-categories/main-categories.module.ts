import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MainCategoriesService } from './main-categories.service';
import { MainCategoriesController } from './main-categories.controller';
import { MainCategory, MainCategorySchema } from '../schemas/main-category.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: MainCategory.name, schema: MainCategorySchema },
        ]),
    ],
    controllers: [MainCategoriesController],
    providers: [MainCategoriesService],
    exports: [MainCategoriesService],
})
export class MainCategoriesModule { }
