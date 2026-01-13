import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateCategoryDto {
    @ApiProperty({
        example: 'Electronics',
        description: 'The name of the category',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        example: 'Mobile phones and laptops',
        description: 'Category description',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        example: 'http://example.com/image.png',
        description: 'Category image URL',
        required: false,
    })
    @IsOptional()
    @IsString()
    image?: string;

    // @ApiProperty({ enum: ['active', 'inactive'], default: 'active', description: 'Status of the category', required: false })
    // @IsOptional()
    // @IsEnum(['active', 'inactive'])
    // status?: string;
}
