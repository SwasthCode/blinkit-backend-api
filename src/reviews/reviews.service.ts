import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '../common/base/base.service';
import { Review, ReviewDocument } from '../schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

import { FirebaseService } from '../common/firebase/firebase.service';

@Injectable()
export class ReviewsService extends BaseService<ReviewDocument> {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    private readonly firebaseService: FirebaseService,
  ) {
    super(reviewModel);
    this.searchFields = ['comment', 'status'];
  }

  async create(
    createReviewDto: CreateReviewDto,
    files?: Express.Multer.File[],
  ): Promise<ReviewDocument> {
    if (files && files.length > 0) {
      const uploadPromises = files.map((file) =>
        this.firebaseService.uploadFile(file, 'reviews'),
      );
      const imageUrls = await Promise.all(uploadPromises);
      createReviewDto.images = imageUrls.map((url) => ({ url }));
    } else {
      if (!Array.isArray(createReviewDto.images)) {
        delete createReviewDto.images;
      }
    }
    const createdReview = new this.reviewModel(createReviewDto);
    return createdReview.save();
  }

  async update(
    id: string,
    updateReviewDto: UpdateReviewDto,
    files?: Express.Multer.File[],
  ): Promise<ReviewDocument> {
    if (files && files.length > 0) {
      const uploadPromises = files.map((file) =>
        this.firebaseService.uploadFile(file, 'reviews'),
      );
      const imageUrls = await Promise.all(uploadPromises);
      updateReviewDto.images = imageUrls.map((url) => ({ url }));
    }
    const updatedReview = await this.reviewModel
      .findByIdAndUpdate(id, updateReviewDto, { new: true })
      .exec();
    if (!updatedReview) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    return updatedReview;
  }

  async remove(id: string): Promise<any> {
    const deletedReview = await this.reviewModel.findByIdAndDelete(id).exec();
    if (!deletedReview) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    return deletedReview;
  }

  async findByProduct(productId: string): Promise<ReviewDocument[]> {
    return this.reviewModel
      .find({ product_id: productId })
      .populate('user_id', 'first_name last_name profile_image')
      .exec();
  }
}
