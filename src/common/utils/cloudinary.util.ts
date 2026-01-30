import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

const configureCloudinary = () => {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error('Cloudinary environment variables not set');
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

export const uploadToCloudinary = async (keyName: string, filePath: string) => {
  configureCloudinary();
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        public_id: keyName,
        folder: 'deal-swipe/skill-link',
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result?.secure_url,
          result: result,
        });
      },
    );
  });
};

export const uploadToCloudinaryBuffer = async (
  keyName: string,
  buffer: Buffer,
) => {
  configureCloudinary();
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: keyName,
        folder: 'deal-swipe/skill-link',
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result?.secure_url,
          result: result,
        });
      },
    );
    Readable.from(buffer).pipe(uploadStream);
  });
};
