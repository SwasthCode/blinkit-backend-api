import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => {
        return {
          uri: process.env.MONGODB_URI  ,
          dbName: process.env.DATABASE_NAME || 'temp-api',
        };
      },
    }),
    UsersModule,
    AuthModule,
    RolesModule,
  ],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    // Set up connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connected successfully!');
      console.log(`📊 Database: ${mongoose.connection.db?.databaseName}`);
      console.log(`🔗 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
      console.error('💡 Make sure MongoDB is running on your system!');
      console.error('   - Install MongoDB: https://docs.mongodb.com/manual/installation/');
      console.error('   - Or use Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest');
      console.error('   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas');
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected.');
    });

    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB already connected!');
      console.log(`📊 Database: ${mongoose.connection.db?.databaseName}`);
      console.log(`🔗 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    }
  }
}
