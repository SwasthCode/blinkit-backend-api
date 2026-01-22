import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsOptional, IsArray, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    @ApiProperty({
        description: 'List of image _ids to remove from the product',
        example: '["64b5f93...", "64b5f94..."]',
        required: false,
        type: 'string', // Swagger often handles array of strings better if hinted, but here it's consumed as stringified JSON or array
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch (e) {
                return [];
            }
        }
        return value;
    })
    removedImageIds?: string[];

    @ApiProperty({
        description: 'Single image _id to remove (alias for backward compatibility or singular use)',
        required: false,
        type: 'string',
    })
    @IsOptional()
    removedImageId?: string;
}
