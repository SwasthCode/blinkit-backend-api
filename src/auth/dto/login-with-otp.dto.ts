import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginWithOtpDto {
  @ApiProperty({
    description: 'The Firebase ID Token received after OTP verification',
    example: '+919876543210',
  })
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone number must be a string' })
  phone_number: string;
}
