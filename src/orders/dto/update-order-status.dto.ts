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
      'shipped',
      'delivered',
      'cancelled',
      'returned',
    ],
    example: 'ready',
  })
  @IsNotEmpty()
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
  status: string;
}
