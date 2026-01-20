import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '9876543210' })
  @IsNotEmpty()
  @IsString()
  shipping_phone: string;

  @ApiProperty({ example: '110001' })
  @IsNotEmpty()
  @IsString()
  pincode: string;

  @ApiProperty({ example: 'Connaught Place' })
  @IsNotEmpty()
  @IsString()
  locality: string;

  @ApiProperty({ example: 'Flat 101, Building A' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ example: 'New Delhi' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ example: 'Delhi' })
  @IsNotEmpty()
  @IsString()
  state: string;

  @ApiProperty({ example: 'Near Metro Station', required: false })
  @IsOptional()
  @IsString()
  landmark?: string;

  @ApiProperty({ example: '9876543211', required: false })
  @IsOptional()
  @IsString()
  alternate_phone?: string;

  @ApiProperty({ example: 'Home', enum: ['Home', 'Work'] })
  @IsNotEmpty()
  @IsEnum(['Home', 'Work'])
  type: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ example: '696fab3ab3132b1a53be39b3', required: false })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  userInfo?: any;
}
