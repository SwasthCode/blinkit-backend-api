import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsMongoId, Min } from 'class-validator';

export class AddToCartDto {
    @ApiProperty({ example: 'Product ID' })
    @IsNotEmpty()
    @IsMongoId()
    product_id: string;

    @ApiProperty({ example: 1, minimum: 1 })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    quantity: number;
}
