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
import { MainCategoryDocument } from '../schemas/main-category.schema';
import { MainCategoriesService } from './main-categories.service';
import { UpdateMainCategoryDto, CreateMainCategoryDto } from './dto';
import { successResponse } from '../common/base/base.response';

@ApiTags('Main Categories')
@Controller('main-categories')
export class MainCategoriesController extends BaseController<MainCategoryDocument> {
  constructor(private readonly mainCategoriesService: MainCategoriesService) {
    super(mainCategoriesService);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new main category' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['name'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'MainCategory created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  async create(
    @Body() createMainCategoryDto: CreateMainCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data = await this.mainCategoriesService.create(
      createMainCategoryDto,
      file,
    );
    return successResponse(data, 'MainCategory created successfully', 201);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update main category by ID' })
  @ApiParam({ name: 'id', description: 'MainCategory ID' })
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
  @ApiResponse({
    status: 200,
    description: 'MainCategory updated successfully',
  })
  @ApiResponse({ status: 404, description: 'MainCategory not found' })
  async update(
    @Param('id') id: string,
    @Body() updateMainCategoryDto: UpdateMainCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data = await this.mainCategoriesService.update(
      id,
      updateMainCategoryDto,
      file,
    );
    return successResponse(data, 'MainCategory updated successfully');
  }
}
