import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsEnum,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
    minLength: 2,
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'First name is required' })
  @IsString({ message: 'First name must be a string' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  first_name: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
    minLength: 2,
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'Last name is required' })
  @IsString({ message: 'Last name must be a string' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  last_name: string;

  @ApiProperty({
    description: 'The phone number of the user',
    example: '+919876543210',
  })
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone number must be a string' })
  phone_number: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
    format: 'email',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'SecurePassword123!',
    minLength: 8,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password?: string;

  @ApiProperty({
    description: 'The role of the user',
    example: 'user',
    enum: ['admin', 'user', 'moderator'],
    default: 'user',
  })
  @IsOptional()
  @IsEnum(['admin', 'user', 'moderator'], {
    message: 'Role must be one of: admin, user, moderator',
  })
  role?: string;

  @ApiProperty({
    description: 'The status of the user',
    example: 'active',
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended'], {
    message: 'Status must be one of: active, inactive, suspended',
  })
  status?: string;

  @ApiProperty({
    description: 'The profile image URL of the user',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Profile image must be a string' })
  profile_image?: string;
}
