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
// import { diskStorage } from 'multer';
import { extname } from 'path';
import { successResponse } from '../common/base/base.response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) { }

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload a new banner with image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        link_url: { type: 'string' },
        priority: { type: 'number' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  // @UseInterceptors(
  //   FileInterceptor('file', {
  //     storage: diskStorage({
  //       destination: './uploads/banners',
  //       filename: (req, file, cb) => {
  //         const randomName = Array(32)
  //           .fill(null)
  //           .map(() => Math.round(Math.random() * 16).toString(16))
  //           .join('');
  //         return cb(null, `${randomName}${extname(file.originalname)}`);
  //       },
  //     }),
  //   }),
  // )
  async uploadBanner(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    const createBannerDto: CreateBannerDto = {
      title: body.title,
      image_url: `/uploads/banners/${file.filename}`,
      link_url: body.link_url,
      priority: body.priority ? parseInt(body.priority) : 0,
      status: 'active',
    };
    const data = await this.bannersService.createBanner(createBannerDto);
    return successResponse(data, 'Banner uploaded successfully', 201);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active banners' })
  async getActiveBanners() {
    const data = await this.bannersService.findActiveBanners();
    return successResponse(data, 'Active banners retrieved successfully');
  }
}
