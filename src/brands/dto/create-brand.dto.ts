import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsMongoId } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({
    example: 'Samsung',
    description: 'The name of the brand',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Brand logo image file',
    required: false,
  })
  @IsOptional()
  image?: any;

  @ApiProperty({ example: '65a123...', description: 'Main Category ID' })
  @IsNotEmpty()
  @IsMongoId()
  main_category_id: string;

  @ApiProperty({
    default: 'active',
    description: 'Status of the brand',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;
}
