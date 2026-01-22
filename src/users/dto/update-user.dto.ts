import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  last_name?: string;

  // @ApiProperty({
  //   description: 'The phone number of the user',
  //   example: '+919876543210',
  // })
  // @IsOptional()
  // @IsString()
  // phone_number?: string;

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
  // password?: string;

  // @ApiProperty({
  //   description: 'The role of the user',
  //   example: 'user',
  //   enum: ['admin', 'user', 'moderator'],
  //   default: 'user',
  // })
  // @IsOptional()
  // @IsEnum(['admin', 'user', 'moderator'], {
  //   message: 'Role must be one of: admin, user, moderator',
  // })
  // role?: string;

  // @ApiProperty({
  //   description: 'The status of the user',
  //   example: 'active',
  //   enum: ['active', 'inactive', 'suspended'],
  //   default: 'active',
  // })
  // @IsOptional()
  // @IsEnum(['active', 'inactive', 'suspended'], {
  //   message: 'Status must be one of: active, inactive, suspended',
  // })
  // status?: string;

  @ApiProperty({
    description: 'The profile image file (FormData)',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  @IsString()
  profile_image?: any;
}
