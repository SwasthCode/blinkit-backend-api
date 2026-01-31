import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  password: string;
}
