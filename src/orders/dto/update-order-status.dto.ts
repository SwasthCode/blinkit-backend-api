import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class UpdateOrderItemDto {
  @ApiProperty({ example: '65a...', description: 'Product ID' })
  @IsNotEmpty()
  @IsString()
  product_id: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  brand_name?: string;
}

export class WorkerUpdateDto {
  @ApiProperty({ example: '65a...', description: 'User ID', required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: '65a...', description: 'User ID', required: false })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  remark_msg?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  updated_at?: any;

  @IsOptional()
  status_history?: any[];

  @IsOptional()
  _id?: string;
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
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
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

  @ApiProperty({
    example: '65a...',
    description: 'Address ID',
    required: false,
  })
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
  @IsBoolean()
  picker_accepted?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  picker_remark?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  packer_remark?: string;

  @ApiProperty({ type: WorkerUpdateDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkerUpdateDto)
  picker_obj?: WorkerUpdateDto;

  @ApiProperty({ type: WorkerUpdateDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkerUpdateDto)
  packer_obj?: WorkerUpdateDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  order_remark?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  remark_msg?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  payment_details?: any;
}
