import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class UpdateOrderItemDto {
  @ApiProperty({ example: '65a...', description: 'Product ID' })
  @IsNotEmpty()
  @IsString()
  product_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  image: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsNotEmpty()
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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  shipping_address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  shipping_phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  customer_name?: string;

  @ApiProperty({ example: '65a...', description: 'Address ID', required: false })
  @IsOptional()
  @IsString()
  address_id?: string;

  @ApiProperty({ example: '65a...', description: 'Packer ID', required: false })
  @IsOptional()
  @IsString()
  packer_id?: string;

  @ApiProperty({ example: '65a...', description: 'Picker ID', required: false })
  @IsOptional()
  @IsString()
  picker_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  picker_accepted?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  picker_remark?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  packer_remark?: string;
}
