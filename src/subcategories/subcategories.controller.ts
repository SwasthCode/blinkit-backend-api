import {
  Controller,
  Put,
  Param,
  Body,
  Post,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { BaseController } from '../common/base/base.controller';
import { SubCategoryDocument } from '../schemas/subcategory.schema';
import { SubCategoriesService } from './subcategories.service';
import { UpdateSubCategoryDto, CreateSubCategoryDto } from './dto';
import { successResponse } from '../common/base/base.response';

@ApiTags('Subcategories')
@Controller('subcategories')
export class SubCategoriesController extends BaseController<SubCategoryDocument> {
  constructor(private readonly subCategoriesService: SubCategoriesService) {
    super(subCategoriesService);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new subcategory' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        category_id: { type: 'string' },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['name', 'category_id'],
    },
  })
  @ApiResponse({ status: 201, description: 'SubCategory created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  async create(
    @Body() createSubCategoryDto: CreateSubCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data = await this.subCategoriesService.create(
      createSubCategoryDto,
      file,
    );
    return successResponse(data, 'SubCategory created successfully', 201);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update subcategory by ID' })
  @ApiParam({ name: 'id', description: 'SubCategory ID' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        category_id: { type: 'string' },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'SubCategory updated successfully' })
  @ApiResponse({ status: 404, description: 'SubCategory not found' })
  async update(
    @Param('id') id: string,
    @Body() updateSubCategoryDto: UpdateSubCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data = await this.subCategoriesService.update(
      id,
      updateSubCategoryDto,
      file,
    );
    return successResponse(data, 'SubCategory updated successfully');
  }
  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get subcategories by Category ID' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'List of subcategories found' })
  async findByCategory(@Param('categoryId') categoryId: string) {
    const data = await this.subCategoriesService.findAll({
      filter: JSON.stringify({ category_id: categoryId }),
    });
    return successResponse(data, 'SubCategories fetched successfully');
  }
}
