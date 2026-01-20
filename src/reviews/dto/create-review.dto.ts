import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @ApiProperty({ example: 'Product ID', required: false })
  @IsOptional()
  product_id: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Great product!', required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false,
  })
  @IsOptional()
  images?: any[];

  @ApiProperty({ example: 'User ID', required: false })
  @IsOptional()
  user_id?: string;

  @ApiProperty({ example: 'active', required: false })
  @IsOptional()
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  userInfo?: any;
}
