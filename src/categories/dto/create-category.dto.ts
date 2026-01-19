import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsMongoId } from 'class-validator';

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

    @ApiProperty({ example: '65a123...', description: 'Main Category ID' })
    @IsNotEmpty()
    @IsMongoId()
    main_category_id: string;

    @ApiProperty({ default: 'active', description: 'Status of the category', required: false })
    @IsOptional()
    status?: string;
}
