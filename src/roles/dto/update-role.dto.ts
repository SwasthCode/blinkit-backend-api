import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { CreateRoleDto } from './create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @ApiProperty({
    description: 'The unique key of the role',
    example: 'employee',
    required: false,
  })
  @IsOptional()
  @IsString()
  key?: string;

  @ApiProperty({
    description: 'The role type number',
    example: 27,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  role_type?: number;

  @ApiProperty({
    description: 'The unique role ID',
    example: 27,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  role_id?: number;
}

