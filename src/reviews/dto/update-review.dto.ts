import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateReviewDto } from './create-review.dto';
import { IsOptional, IsArray } from 'class-validator';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  @ApiProperty({ required: false, description: 'Review images' })
  @IsOptional()
  @IsArray()
  images?: any[];
}
