import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MainCategoriesService } from './main-categories.service';
import { MainCategoriesController } from './main-categories.controller';
import {
  MainCategory,
  MainCategorySchema,
} from '../schemas/main-category.schema';
import { Category, CategorySchema } from '../schemas/category.schema';
import {
  SubCategory,
  SubCategorySchema,
} from '../schemas/subcategory.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MainCategory.name, schema: MainCategorySchema },
      { name: Category.name, schema: CategorySchema },
      { name: SubCategory.name, schema: SubCategorySchema },
    ]),
  ],
  controllers: [MainCategoriesController],
  providers: [MainCategoriesService],
  exports: [MainCategoriesService],
})
export class MainCategoriesModule { }