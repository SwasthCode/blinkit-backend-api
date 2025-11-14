import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'The name of the role',
    example: 'Employee',
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  name: string;
}
