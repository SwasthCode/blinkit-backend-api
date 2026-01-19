import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsMongoId } from 'class-validator';

export class CreateSubCategoryDto {
  @ApiProperty({
    example: 'Smartphones',
    description: 'The name of the subcategory',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Mobile phones',
    description: 'SubCategory description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '65a123...', description: 'Parent Category ID' })
  @IsNotEmpty()
  @IsMongoId()
  category_id: string;

  @ApiProperty({
    example: 'http://example.com/image.png',
    description: 'SubCategory image URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({
    default: 'active',
    description: 'Status of the subcategory',
    required: false,
  })
  @IsOptional()
  status?: string;
}
