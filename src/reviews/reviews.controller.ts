import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
  Put,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './dto';
import { BaseController } from '../common/base/base.controller';
import { ReviewDocument } from '../schemas/review.schema';
import { successResponse } from '../common/base/base.response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController extends BaseController<ReviewDocument> {
  constructor(private readonly reviewsService: ReviewsService) {
    super(reviewsService);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new review' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 5))
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  async create(
    @Body() createReviewDto: CreateReviewDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {

    const data = await this.reviewsService.create(createReviewDto, files);
    return successResponse(data, 'Review created successfully', 201);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authentication')
  @ApiOperation({ summary: 'Update review by ID' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 5))
  async update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const data = await this.reviewsService.update(id, updateReviewDto, files);
    return successResponse(data, 'Review updated successfully');
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get reviews by Product ID' })
  async findByProduct(@Param('productId') productId: string) {
    const data = await this.reviewsService.findByProduct(productId);
    return successResponse(data, 'Reviews fetched successfully');
  }
}
