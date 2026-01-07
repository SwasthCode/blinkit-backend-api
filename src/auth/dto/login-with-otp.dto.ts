import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginWithOtpDto {
    @ApiProperty({
        description: 'The Firebase ID Token received after OTP verification',
        example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6...',
    })
    @IsNotEmpty({ message: 'Firebase token is required' })
    @IsString({ message: 'Firebase token must be a string' })
    firebase_token: string;
}
