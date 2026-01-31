import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsMongoId,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ example: 'Product Name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Product Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Product Price' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  price: number;

  @ApiProperty({ example: 'Product MRP' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  mrp: number;

  @ApiProperty({ example: 'Product Unit' })
  @IsNotEmpty()
  @IsString()
  unit: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false,
  })
  @IsOptional()
  images?: any[];

  @ApiProperty({ example: 'Product Category ID' })
  @IsNotEmpty()
  @IsMongoId()
  category_id: string;

  @ApiProperty({ example: 'Product Subcategory ID' })
  @IsNotEmpty()
  @IsMongoId()
  subcategory_id: string;

  @ApiProperty({ example: 'Product Stock' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  stock?: number;

  @ApiProperty({ example: 'Product Is Available' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({
    example:
      '[{ "id": "v1", "label": "1 kg", "price": 85, "originalPrice": 100, "discount": "15% off", "shelfLife": "24 Months", "expiryDate": "10 Oct 2025", "manufacturer": "Organic Farms", "manufacturerAddress": "Bangalore" }]',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
    return value;
  })
  variants?: any[];

  @ApiProperty({ example: 'India' })
  @IsOptional()
  @IsString()
  countryOfOrigin?: string;

  @ApiProperty({ example: '24 Months' })
  @IsOptional()
  @IsString()
  shelfLife?: string;

  @ApiProperty({ example: 'Organic Farms India' })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiProperty({ example: 'Organic Zone, Bangalore' })
  @IsOptional()
  @IsString()
  manufacturerAddress?: string;

  @ApiProperty({ example: '10 Oct 2025' })
  @IsOptional()
  @IsString()
  expiryDate?: string;

  @ApiProperty({ example: 'Brand ID' })
  @IsOptional()
  @IsMongoId()
  brand_id?: string;
}
