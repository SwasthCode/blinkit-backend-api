import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateMainCategoryDto {
  @ApiProperty({
    example: 'Electronics',
    description: 'The name of the main category',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'All kind of electronics',
    description: 'Main Category description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'http://example.com/image.png',
    description: 'Main Category image URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({
    default: 'active',
    description: 'Status of the main category',
    required: false,
  })
  @IsOptional()
  status?: string;
}
