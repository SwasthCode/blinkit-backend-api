import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class UpdateOrderItemDto {
  @ApiProperty({ example: '65a...', description: 'Product ID' })
  @IsOptional()
  @IsString()
  product_id: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  image: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  brand_name?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ type: [UpdateOrderItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  items?: UpdateOrderItemDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  total_amount?: number;

  @ApiProperty({
    description: 'Status of the order',
    enum: [
      'pending',
      'ready',
      'hold',
      'ship',
      'shipped',
      'delivered',
      'cancelled',
      'returned',
    ],
    example: 'ready',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.toLowerCase() : value)
  @IsEnum([
    'pending',
    'ready',
    'hold',
    'ship',
    'shipped',
    'delivered',
    'cancelled',
    'returned',
  ])
  status?: string;
}
