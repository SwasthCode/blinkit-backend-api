import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateOrderStatusDto {
    @ApiProperty({
        description: 'Status of the order',
        enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
        example: 'Confirmed',
    })
    @IsNotEmpty()
    @IsEnum(['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'])
    status: string;
}
