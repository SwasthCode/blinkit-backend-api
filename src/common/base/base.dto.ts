import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsDateString,
  IsBoolean,
  IsString,
  IsArray,
} from 'class-validator';

export class BaseDto {
  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'CreatedAt must be a valid date string' })
  createdAt?: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'UpdatedAt must be a valid date string' })
  updatedAt?: Date;
}

export class CreateBaseDto {
  @ApiProperty({
    description: 'Whether the entity is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'is_active must be a boolean' })
  is_active?: boolean;

  @ApiProperty({
    description: 'Whether the entity is deleted',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'is_deleted must be a boolean' })
  is_deleted?: boolean;

  @ApiProperty({
    description: 'Entity status',
    example: 'active',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Status must be a string' })
  status?: string;

  // @ApiProperty({
  //   description: 'Entity roles',
  //   example: [],
  //   required: false,
  // })
  // @IsOptional()
  // @IsArray({ message: 'Roles must be an array' })
  // roles?: any[];
}

export class UpdateBaseDto {
  @ApiProperty({
    description: 'Whether the entity is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'is_active must be a boolean' })
  is_active?: boolean;

  @ApiProperty({
    description: 'Whether the entity is deleted',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'is_deleted must be a boolean' })
  is_deleted?: boolean;

  @ApiProperty({
    description: 'Entity status',
    example: 'active',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Status must be a string' })
  status?: string;

  // @ApiProperty({
  //   description: 'Entity roles',
  //   example: [],
  //   required: false,
  // })
  // @IsOptional()
  // @IsArray({ message: 'Roles must be an array' })
  // roles?: any[];
}
