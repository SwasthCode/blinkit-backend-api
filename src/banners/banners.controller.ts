import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto';
import { BaseController } from '../common/base/base.controller';
import { BannerDocument } from '../schemas/banner.schema';
import { successResponse } from '../common/base/base.response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Banners')
@Controller('banners')
export class BannersController extends BaseController<BannerDocument> {
  constructor(private readonly bannersService: BannersService) {
    super(bannersService);
  }

  @Post()
  @UseGuards(JwtAuthGuard) // Only admins/staff should ideally create banners, but for now simple auth
  @ApiBearerAuth('authentication')
  @ApiOperation({ summary: 'Create a new banner' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @ApiResponse({ status: 201, description: 'Banner created successfully' })
  // @ts-ignore
  async create(
    @Body() createBannerDto: CreateBannerDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data = await this.bannersService.create(createBannerDto, file);
    return successResponse(data, 'Banner created successfully', 201);
  }

  // @Put(':id')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth('authentication')
  // @ApiOperation({ summary: 'Update banner by ID' })
  // @ApiConsumes('multipart/form-data')
  // @UseInterceptors(FileInterceptor('image'))
  // async update(
  //     @Param('id') id: string,
  //     @Body() updateBannerDto: UpdateBannerDto,
  //     @UploadedFile() file?: Express.Multer.File,
  // ) {
  //     const data = await this.bannersService.update(id, updateBannerDto, file);
  //     return successResponse(data, 'Banner updated successfully');
  // }

  @Get('active')
  @ApiOperation({ summary: 'Get active banners (public)' })
  async findActive(@Query('position') position?: string) {
    const data = await this.bannersService.findActive(position);
    return successResponse(data, 'Active banners fetched successfully');
  }

  // Default CRUD remain available (findAll, findOne, remove)
}
