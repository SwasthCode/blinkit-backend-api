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
import { CategoryDocument } from '../schemas/category.schema';
import { CategoriesService } from './categories.service';
import { UpdateCategoryDto, CreateCategoryDto } from './dto';
import { successResponse } from '../common/base/base.response';
import { uploadToCloudinaryBuffer } from '../common/utils/cloudinary.util';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController extends BaseController<CategoryDocument> {
    constructor(private readonly categoriesService: CategoriesService) {
        super(categoriesService);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new category' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image'))
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                // status: { type: 'string', enum: ['active', 'inactive'], default: 'active' },
                image: {
                    type: 'string',
                    format: 'binary',
                },
            },
            required: ['name'],
        },
    })
    @ApiResponse({ status: 201, description: 'Category created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
    async create(
        @Body() createCategoryDto: CreateCategoryDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (file) {
            createCategoryDto.image = `/uploads/${file.filename}`;
        }
        const data = await this.categoriesService.create(createCategoryDto);
        return successResponse(data, 'Category created successfully', 201);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update category by ID' })
    @ApiParam({ name: 'id', description: 'Category ID' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image'))
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                status: { type: 'string', enum: ['active', 'inactive'] },
                image: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Category updated successfully' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    async update(
        @Param('id') id: string,
        @Body() updateCategoryDto: UpdateCategoryDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (file) {
            updateCategoryDto.image = `/uploads/${file.filename}`;
        }
        const data = await this.categoriesService.update(id, updateCategoryDto);
        return successResponse(data, 'Category updated successfully');
    }
}
