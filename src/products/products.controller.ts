import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseInterceptors,
    UploadedFile,
    Put,
    HttpCode,
    HttpStatus,
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
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { BaseController } from '../common/base/base.controller';
import { ProductDocument } from '../schemas/product.schema';
import { successResponse } from '../common/base/base.response';

@ApiTags('products')
@Controller('products')
export class ProductsController extends BaseController<ProductDocument> {
    constructor(private readonly productsService: ProductsService) {
        super(productsService);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new product' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image'))
    @ApiResponse({ status: 201, description: 'Product created successfully' })
    async create(
        @Body() createProductDto: CreateProductDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (file) {
            createProductDto.image = `/uploads/${file.filename}`;
        }
        const data = await this.productsService.create(createProductDto);
        return successResponse(data, 'Product created successfully', 201);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update product by ID' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image'))
    async update(
        @Param('id') id: string,
        @Body() updateProductDto: UpdateProductDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (file) {
            updateProductDto.image = `/uploads/${file.filename}`;
        }
        const data = await this.productsService.update(id, updateProductDto);
        return successResponse(data, 'Product updated successfully');
    }
}
