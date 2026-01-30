import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
    @ApiProperty({ required: false, description: 'Category image URL' })
    @IsOptional()
    @IsString()
    image?: string;
}
