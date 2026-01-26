import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PackersController } from './packers.controller';
import { PackersService } from './packers.service';
import { Packer, PackerSchema } from '../schemas/packer.schema';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Packer.name, schema: PackerSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [PackersController],
  providers: [PackersService],
  exports: [PackersService],
})
export class PackersModule {}
