import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 'Address ID' })
  @IsNotEmpty()
  address_id: string;

  @ApiProperty({ example: 'COD', required: false })
  @IsOptional()
  @IsString()
  payment_method?: string;
}
