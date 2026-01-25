
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsMongoId, IsOptional, IsEnum } from 'class-validator';

export class CreateInvoiceDto {
  @ApiProperty({ example: '65a1b2c3d4e5f6g7h8i9j0k1', description: 'Order ID' })
  @IsNotEmpty()
  @IsMongoId()
  order_id: string;

  @ApiProperty({
    example: 'pending',
    enum: ['pending', 'paid', 'cancelled'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['pending', 'paid', 'cancelled'])
  status?: string;
}
