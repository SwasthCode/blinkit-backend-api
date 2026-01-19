import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
    private storage: admin.storage.Storage;
    private bucket: any;

    onModuleInit() {
        const serviceAccountPath = path.resolve(
            process.cwd(),
            'blinkit-be-e491a-firebase-adminsdk-fbsvc-f73aa43991.json',
        );

        // Explicitly set the env var for underlying Google Auth libraries
        process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccountPath;

        if (admin.apps.length === 0) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const serviceAccount = require(serviceAccountPath);

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: 'blinkit-be-e491a.appspot.com',
            });
        }

        this.storage = admin.storage();
        this.bucket = this.storage.bucket('blinkit-be-e491a.firebasestorage.app');
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
