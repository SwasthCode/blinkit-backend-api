import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';

export class CreateBannerDto {
    @ApiProperty({
        description: 'The title of the banner',
        example: 'Mega Sale 2024',
    })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({
        description: 'The URL of the banner image',
        example: 'https://example.com/banner.jpg',
    })
    @IsOptional() // Image can be uploaded separately or as part of a multi-part request
    @IsString()
    image_url: string;

    @ApiProperty({
        description: 'The link URL the banner points to',
        example: '/products/123',
        required: false,
    })
    @IsOptional()
    @IsString()
    link_url?: string;

    @ApiProperty({
        description: 'The status of the banner',
        example: 'active',
        enum: ['active', 'inactive'],
        default: 'active',
    })
    @IsOptional()
    @IsEnum(['active', 'inactive'])
    status?: string;

    @ApiProperty({
        description: 'Priority for display (higher numbers first)',
        example: 1,
        default: 0,
    })
    @IsOptional()
    @IsNumber()
    priority?: number;
}
