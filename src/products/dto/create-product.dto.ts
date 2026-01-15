import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsMongoId, IsBoolean } from 'class-validator';
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

    @ApiProperty({ type: 'string', format: 'binary', required: false })
    @IsOptional()
    @IsString()
    image?: string;

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
}
