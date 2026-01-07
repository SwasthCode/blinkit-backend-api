import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';

@ApiTags('Cloudinary Image Uploader')
@Controller('upload')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    required: true,
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    console.log('Received file:', file);

    if (!file || !file.buffer) {
      throw new BadRequestException(
        'File is not provided or does not have a buffer',
      );
    }
    // Upload to Cloudinary
    const cloudinaryResponse = await this.cloudinaryService.uploadImage(
      file,
      'Skill-links',
    );

    return {
      url: cloudinaryResponse.url,
      result: cloudinaryResponse.result,
    };
  }
}
