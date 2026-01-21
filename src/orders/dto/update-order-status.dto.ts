import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'Status of the order',
    enum: [
      'Pending',
      'Ready',
      'Hold',
      'Shipped',
      'Delivered',
      'Cancelled',
      'Returned',
    ],
    example: 'Ready',
  })
  @IsNotEmpty()
  @IsEnum([
    'Pending',
    'Ready',
    'Hold',
    'Shipped',
    'Delivered',
    'Cancelled',
    'Returned',
  ])
  status: string;
}
