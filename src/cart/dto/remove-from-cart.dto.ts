import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsMongoId } from 'class-validator';

export class RemoveFromCartDto {
  @ApiProperty({ example: 'Product ID' })
  @IsNotEmpty()
  @IsMongoId()
  product_id: string;
}
