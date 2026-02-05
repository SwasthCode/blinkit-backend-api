import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateShiftDto {
    @ApiProperty({ example: '60d0fe4f5311236168a109ca', description: 'User ID of the delivery partner' })
    @IsString()
    @IsNotEmpty()
    user_id: string;

    @ApiProperty({ example: '2023-10-27T08:00:00.000Z', description: 'Start time of the shift' })
    @IsDateString()
    @IsNotEmpty()
    start_time: string;

    @ApiProperty({ example: '2023-10-27T16:00:00.000Z', description: 'End time of the shift' })
    @IsDateString()
    @IsNotEmpty()
    end_time: string;
}
