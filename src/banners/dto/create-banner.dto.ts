import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBannerDto {
  @ApiProperty({ type: 'string', format: 'binary', required: true })
  @IsOptional()
  image: any;

  @ApiProperty({
    example: 'home_main',
    enum: ['home_main', 'home_secondary', 'category'],
  })
  @IsNotEmpty()
  @IsEnum(['home_main', 'home_secondary', 'category'])
  position: string;

  @ApiProperty({ example: true, required: false, default: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: '/products/123', required: false })
  @IsOptional()
  @IsString()
  target_url?: string;
}
