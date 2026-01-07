
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { BannersModule } from './banners/banners.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      'mongodb+srv://vedatmanepc:uvnNRUsi2tS0HFLN@cluster0.hjuni3e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
      {
        dbName: process.env.DATABASE_NAME,
      },
    ),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_CONSTANTS_SECRET || 'base-api-secret-key',
      signOptions: { expiresIn: '1440h' },
    }),
    MongooseModule.forFeature([


    ]),
    UsersModule,
    AuthModule,
    RolesModule,
    BannersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule { }
