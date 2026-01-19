import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
    IsOptional,
    IsArray,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class DirectOrderItemDto {
    @ApiProperty({ example: '65a...', description: 'Product ID' })
    @IsNotEmpty()
    @IsString()
    product_id: string;

    @ApiProperty({ example: 2, description: 'Quantity' })
    @IsNotEmpty()
    quantity: number;
}

export class CreateDirectOrderDto {
    @ApiProperty({ example: 'Address ID' })
    @IsNotEmpty()
    address_id: string;

    @ApiProperty({ example: 'COD', required: false })
    @IsOptional()
    @IsString()
    payment_method?: string;

    @ApiProperty({
        type: [DirectOrderItemDto],
        description: 'Array of items to order',
        example: [{ product_id: '65a...', quantity: 2 }],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DirectOrderItemDto)
    items: DirectOrderItemDto[];
}
