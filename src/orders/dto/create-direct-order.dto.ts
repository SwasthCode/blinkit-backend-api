import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DirectOrderItemDto {
  @ApiProperty({ example: '65a...', description: 'Product ID' })
  @IsNotEmpty()
  @IsString()
  product_id: string;

  @ApiProperty({ example: 2, description: 'Quantity' })
  @IsNotEmpty()
  quantity: number;
}

export class PaymentDto {
  @ApiProperty({ example: 'Online' })
  @IsString()
  @IsNotEmpty()
  method: string;

  @ApiProperty({ example: 'pending', required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 'trans_123', required: false })
  @IsOptional()
  transaction_id?: string;

  @ApiProperty({ example: 'razorpay', required: false })
  @IsOptional()
  @IsString()
  gateway?: string;

  @ApiProperty({ example: 'INR', default: 'INR' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: 100, required: false })
  @IsNumber()
  @IsOptional()
  payable_amount?: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsOptional()
  paid_amount?: number;

  @ApiProperty({ example: null, required: false })
  @IsOptional()
  payment_time?: Date;
}

export class WorkerAssignmentInputDto {
  @ApiProperty({ example: 'User ID', required: false })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ example: 'Remark', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class CreateDirectOrderDto {
  @ApiProperty({ example: 'User ID', required: false })
  @IsOptional()
  user_id?: string;

  @ApiProperty({ example: 'Address ID' })
  @IsNotEmpty()
  address_id: string;

  @ApiProperty({ example: 'Packer ID', required: false })
  @IsOptional()
  @IsString()
  packer_id?: string;

  @ApiProperty({ example: 'Picker ID', required: false })
  @IsOptional()
  @IsString()
  picker_id?: string;

  @ApiProperty({ type: WorkerAssignmentInputDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkerAssignmentInputDto)
  picker_obj?: WorkerAssignmentInputDto;

  @ApiProperty({ type: WorkerAssignmentInputDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkerAssignmentInputDto)
  packer_obj?: WorkerAssignmentInputDto;

  @ApiProperty({
    type: [DirectOrderItemDto],
    description: 'Array of items to order',
    example: [{ product_id: '65a...', quantity: 2 }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DirectOrderItemDto)
  items: DirectOrderItemDto[];

  @ApiProperty({ example: 100, description: 'Total Order Amount', required: false })
  @IsOptional()
  @IsNumber()
  total_amount?: number;

  @ApiProperty({ type: PaymentDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentDto)
  payment?: PaymentDto;

  @ApiProperty({ example: 'pending', description: 'Order Status', required: false })
  @IsOptional()
  @IsString()
  order_status?: string;

  @ApiProperty({ example: 'Order remark', required: false })
  @IsOptional()
  @IsString()
  order_remark?: string;

  // Keep for backward compatibility if needed, though payloads use order_status
  @ApiProperty({ example: 'pending', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ example: 'COD', required: false })
  @IsOptional()
  @IsString()
  payment_method?: string;
}

