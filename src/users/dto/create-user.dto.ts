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
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  first_name?: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  last_name?: string;

  @ApiProperty({
    description: 'The phone number of the user',
    example: '9876543210',
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

  // @ApiProperty({
  //   description: 'The password of the user',
  //   example: 'SecurePassword123!',
  //   minLength: 8,
  //   required: false,
  // })
  // @IsOptional()
  // @IsString({ message: 'Password must be a string' })
  // @MinLength(8, { message: 'Password must be at least 8 characters long' })
  // password?: string;

  @ApiProperty({
    description: 'The role of the user',
    default: [],
    type: [Number],
  })
  @IsOptional()
  role?: number[];

  @ApiProperty({
    description: 'The status of the user',
    example: 'active',
    enum: ['active', 'inactive', 'pending'],
    default: 'active',
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'pending'], {
    message: 'Status must be one of: active, inactive, pending',
  })
  status?: string;
}
