import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PackersController } from './packers.controller';
import { PackersService } from './packers.service';
import { Packer, PackerSchema } from '../schemas/packer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Packer.name, schema: PackerSchema }]),
  ],
  controllers: [PackersController],
  providers: [PackersService],
  exports: [PackersService],
})
export class PackersModule {}
