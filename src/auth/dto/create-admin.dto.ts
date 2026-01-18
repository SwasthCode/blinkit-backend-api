import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
    IsStrongPassword,
} from 'class-validator';

export class CreateAdminDto {
    @ApiProperty({
        description: 'The first name of the admin user',
        example: 'Admin',
        minLength: 2,
        maxLength: 50,
    })
    @IsOptional()
    @IsString({ message: 'First name must be a string' })
    @MinLength(2, { message: 'First name must be at least 2 characters long' })
    @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
    first_name?: string;

    @ApiProperty({
        description: 'The last name of the admin user',
        example: 'User',
        minLength: 2,
        maxLength: 50,
    })
    @IsOptional()
    @IsString({ message: 'Last name must be a string' })
    @MinLength(2, { message: 'Last name must be at least 2 characters long' })
    @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
    last_name?: string;

    @ApiProperty({
        description: 'The phone number of the admin user',
        example: '9876543210',
    })
    @IsNotEmpty({ message: 'Phone number is required' })
    @IsString({ message: 'Phone number must be a string' })
    phone_number: string;

    @ApiProperty({
        description: 'The email address of the admin user',
        example: 'admin@example.com',
        format: 'email',
        required: false,
    })
    @IsOptional()
    @IsEmail({}, { message: 'Please provide a valid email address' })
    email?: string;


    // username
    @ApiProperty({
        description: 'The username of the admin user',
        example: 'admin',
        minLength: 2,
        maxLength: 50,
    })
    @IsOptional()
    @IsString({ message: 'Username must be a string' })
    @MinLength(2, { message: 'Username must be at least 2 characters long' })
    @MaxLength(50, { message: 'Username cannot exceed 50 characters' })
    username?: string;

    // password
    @ApiProperty({
        description: 'The password of the admin user',
        example: 'password',
        minLength: 8,
        maxLength: 50,
    })
    @IsNotEmpty({ message: 'Password is required' })
    @IsString({ message: 'Password must be a string' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(50, { message: 'Password cannot exceed 50 characters' })
    @IsStrongPassword(
        {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        },
        {
            message:
                'Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol',
        },
    )
    password: string;

}
