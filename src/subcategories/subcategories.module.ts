import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubCategoriesService } from './subcategories.service';
import { SubCategoriesController } from './subcategories.controller';
import { SubCategory, SubCategorySchema } from '../schemas/subcategory.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: SubCategory.name, schema: SubCategorySchema }]),
    ],
    controllers: [SubCategoriesController],
    providers: [SubCategoriesService],
    exports: [SubCategoriesService],
})
export class SubCategoriesModule { }
