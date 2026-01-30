import { PartialType } from '@nestjs/swagger';
import { CreatePackerDto } from './create-packer.dto';

export class UpdatePackerDto extends PartialType(CreatePackerDto) {}
