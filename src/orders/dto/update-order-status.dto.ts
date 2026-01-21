import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'Status of the order',
    enum: [
      'pending',
      'ready',
      'hold',
      'ship',
      'delivered',
      'cancelled',
      'returned',
    ],
    example: 'ready',
  })
  @IsNotEmpty()
  @IsEnum([
    'pending',
    'ready',
    'hold',
    'ship',
    'delivered',
    'cancelled',
    'returned',
  ])
  @Transform(({ value }) => typeof value === 'string' ? value.toLowerCase() : value)
  status: string;
}
