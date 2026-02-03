import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private storage: Storage;
  private bucket: any;

  constructor(private readonly configService: ConfigService) { }

  onModuleInit() {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.configService
      .get<string>('FIREBASE_PRIVATE_KEY')
      ?.replace(/\\n/g, '\n');
    const storageBucket = this.configService.get<string>(
      'FIREBASE_STORAGE_BUCKET',
    );

    if (!storageBucket) {
      throw new Error('FIREBASE_STORAGE_BUCKET is undefined');
    }

    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    }

    this.storage = new Storage({
      projectId,
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
    });
    this.bucket = this.storage.bucket(storageBucket);
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const fileName = `${folder}/${Date.now()}_${file.originalname}`;
    const fileUpload = this.bucket.file(fileName);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        reject(error);
      });

      stream.on('finish', async () => {
        // Get the public URL
        await fileUpload.makePublic(); // Make the file public
        const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${fileName}`;
        resolve(publicUrl);
      });

      stream.end(file.buffer);
    });
  }
}
