import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateSubCategoryDto } from './create-subcategory.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSubCategoryDto extends PartialType(CreateSubCategoryDto) {
  @ApiProperty({ required: false, description: 'SubCategory image URL' })
  @IsOptional()
  @IsString()
  image?: string;
}
