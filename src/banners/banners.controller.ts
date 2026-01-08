import {
  Controller,
  Post,
  Get,
  Body,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { successResponse } from '../common/base/base.response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
  constructor(
    private readonly bannersService: BannersService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  // @Post('upload')
  // @HttpCode(HttpStatus.CREATED)
  // @ApiOperation({ summary: 'Upload a new banner with image' })
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       title: { type: 'string' },
  //       link_url: { type: 'string' },
  //       priority: { type: 'number' },
  //       file: {
  //         type: 'string',
  //         format: 'binary',
  //       },
  //     },
  //   },
  // })
  // @UseInterceptors(FileInterceptor('file'))
  // async uploadBanner(
  //   @UploadedFile() file: Express.Multer.File,
  //   @Body() body: any,
  // ) {
  //   if (!file) {
  //     throw new Error('File is required');
  //   }

  //   // Upload to Cloudinary
  //   const cloudinaryResponse = await this.cloudinaryService.uploadImage(
  //     file,
  //     'banners',
  //   );

  //   let imageUrl = '';
  //   if ('url' in cloudinaryResponse) {
  //     imageUrl = cloudinaryResponse.url;
  //   } else {
  //     throw new Error('Failed to upload image to Cloudinary');
  //   }

  //   const createBannerDto: CreateBannerDto = {
  //     title: body.title,
  //     image_url: imageUrl,
  //     link_url: body.link_url,
  //     priority: body.priority ? parseInt(body.priority) : 0,
  //     status: 'active',
  //   };
  //   const data = await this.bannersService.createBanner(createBannerDto);
  //   return successResponse(data, 'Banner uploaded successfully', 201);
  // }

  @Get()
  @ApiOperation({ summary: 'Get all active banners' })
  async getActiveBanners() {
    const data = await this.bannersService.findActiveBanners();
    return successResponse(data, 'Active banners retrieved successfully');
  }
}
