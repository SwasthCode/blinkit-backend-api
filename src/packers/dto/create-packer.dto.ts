import { IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePackerDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'john@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'active', enum: ['active', 'inactive'], required: false })
  @IsEnum(['active', 'inactive'])
  @IsOptional()
  status?: string;

  @ApiProperty({ example: '123, Street Name, City', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: '60f1a9b1c9e1b2b3c4d5e6f7', required: false })
  @IsString()
  @IsOptional()
  user_id?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  is_available?: boolean;
}
