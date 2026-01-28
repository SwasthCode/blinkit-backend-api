import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { CreateBrandDto, UpdateBrandDto } from './dto';
import { BaseController } from '../common/base/base.controller';
import { BrandDocument } from '../schemas/brand.schema';
import { successResponse } from '../common/base/base.response';

@ApiTags('Brands')
@Controller('brands')
export class BrandsController extends BaseController<BrandDocument> {
  constructor(private readonly brandsService: BrandsService) {
    super(brandsService);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new brand' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @ApiResponse({ status: 201, description: 'Brand created successfully' })
  async create(
    @Body() createBrandDto: CreateBrandDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data = await this.brandsService.create(createBrandDto, file);
    return successResponse(data, 'Brand created successfully', 201);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search brands by name' })
  async search(@Query('name') name: string) {
    const data = await this.brandsService.search(name);
    return successResponse(data, 'Brands searched successfully');
  }

  @Get('main-category/:id')
  @ApiOperation({ summary: 'Get brands by Main Category ID' })
  async findByMainCategory(@Param('id') id: string) {
    const data = await this.brandsService.findByMainCategory(id);
    return successResponse(data, 'Brands fetched successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update brand by ID' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data = await this.brandsService.update(id, updateBrandDto, file);
    return successResponse(data, 'Brand updated successfully');
  }
}
