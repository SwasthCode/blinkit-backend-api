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
    ApiParam,
    ApiBody,
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

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController extends BaseController<ReviewDocument> {
    constructor(private readonly reviewsService: ReviewsService) {
        super(reviewsService);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new review' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FilesInterceptor('images', 5))
    @ApiResponse({ status: 201, description: 'Review created successfully' })
    // @ts-ignore
    async create(
        @Req() req: any,
        @Body() createReviewDto: CreateReviewDto,
        @UploadedFiles() files?: Express.Multer.File[],
    ) {
        createReviewDto['user_id'] = req.user._id;

        if (files && files.length > 0) {
            createReviewDto.images = files.map(file => ({
                url: `/uploads/${file.filename}`
            }));
        }
        const data = await this.reviewsService.create(createReviewDto);
        return successResponse(data, 'Review created successfully', 201);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update review by ID' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FilesInterceptor('images', 5))
    async update(
        @Param('id') id: string,
        @Body() updateReviewDto: UpdateReviewDto,
        @UploadedFiles() files?: Express.Multer.File[],
    ) {
        if (files && files.length > 0) {
            updateReviewDto.images = files.map(file => ({
                url: `/uploads/${file.filename}`
            }));
        }
        const data = await this.reviewsService.update(id, updateReviewDto);
        return successResponse(data, 'Review updated successfully');
    }

    @Get('product/:productId')
    @ApiOperation({ summary: 'Get reviews by Product ID' })
    async findByProduct(@Param('productId') productId: string) {
        const data = await this.reviewsService.findByProduct(productId);
        return successResponse(data, 'Reviews fetched successfully');
    }
}
