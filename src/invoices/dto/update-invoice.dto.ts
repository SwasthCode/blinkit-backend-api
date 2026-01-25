
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';

export class UpdateInvoiceDto {
  @ApiProperty({
    example: 'paid',
    enum: ['pending', 'paid', 'cancelled'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['pending', 'paid', 'cancelled'])
  status?: string;
}
