import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream from 'buffer-to-stream';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor() {
    v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadBuffer(buffer: Buffer, filename: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: filename,
          folder: `external-event-qr`,
          resource_type: 'image',
        },
        (error, result: any) => {
          if (error) return reject(error);
          resolve(result?.secure_url);
        },
      );
      Readable.from(buffer).pipe(uploadStream);
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
    resourceType: 'image' | 'raw' | 'video' = 'image',
  ): Promise<
    { url: string; result: UploadApiResponse } | UploadApiErrorResponse
  > {
    return new Promise((resolve, reject) => {
      if (!file || !file.buffer) {
        return reject(new Error('File is undefined or does not have a buffer'));
      }

      const upload = v2.uploader.upload_stream(
        {
          public_id: `${Date.now()}`,
          folder: `deal-swipe/${folder}`,
          resource_type: resourceType,
        },
        (error, result: any) => {
          if (error) return reject(error);
          resolve({
            url: result.secure_url,
            result,
          });
        },
      );

      toStream(file.buffer).pipe(upload);
    });
  }

  async uploadImageFromPath(filePath: string): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      // Determine resource type based on file extension
      const fileExtension = filePath.split('.').pop()?.toLowerCase();
      const isPdf = fileExtension === 'pdf';
      const resourceType = isPdf ? 'raw' : 'image';

      cloudinary.uploader.upload(
        filePath,
        {
          folder: 'skillLink/resumes',
          resource_type: resourceType,
        },
        (error, result: any) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(error);
          }
          console.log('Cloudinary upload success:', result);
          resolve(result);
        },
      );
    });
  }
}
