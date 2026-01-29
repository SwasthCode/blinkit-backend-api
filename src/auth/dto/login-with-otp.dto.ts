import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginWithOtpDto {
  @ApiProperty({
    description: 'The Firebase ID Token received after OTP verification',
    example: '9876543210',
  })
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone number must be a string' })
  phone_number: string;

  @ApiProperty({
    description: 'The OTP received after OTP verification',
    example: '1234',
  })
  @IsNotEmpty({ message: 'OTP is required' })
  @IsString({ message: 'OTP must be a string' })
  otp: string;
}
