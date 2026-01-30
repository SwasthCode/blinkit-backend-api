import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateMainCategoryDto } from './create-main-category.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateMainCategoryDto extends PartialType(CreateMainCategoryDto) {
    @ApiProperty({ required: false, description: 'Main Category image URL' })
    @IsOptional()
    @IsString()
    image?: string;
}
