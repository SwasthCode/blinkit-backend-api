import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '../common/base/base.service';
import { Review, ReviewDocument } from '../schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService extends BaseService<ReviewDocument> {
    constructor(
        @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    ) {
        super(reviewModel);
    }

    async create(createReviewDto: CreateReviewDto): Promise<ReviewDocument> {
        const createdReview = new this.reviewModel(createReviewDto);
        return createdReview.save();
    }

    async findAll(options: {
        filter?: string;
        select?: string;
        sort?: string;
        limit?: number;
        skip?: number;
    } = {}): Promise<ReviewDocument[]> {
        const { filter, select, sort, limit, skip } = options;

        let query = {};
        if (filter) {
            try {
                query = JSON.parse(filter);
            } catch (e) {
                console.warn('Invalid JSON filter:', filter);
            }
        }

        let q = this.reviewModel.find(query);

        if (select) {
            q = q.select(select.split(',').join(' '));
        }

        if (sort) {
            try {
                q = q.sort(JSON.parse(sort));
            } catch (e) {
                q = q.sort(sort);
            }
        }

        if (skip) {
            q = q.skip(Number(skip));
        }

        if (limit) {
            q = q.limit(Number(limit));
        }

        return q
            .populate('product_id')
            .populate({
                path: 'user_id',
                select: 'first_name last_name profile_image'
            })
            .exec();
    }

    async update(id: string, updateReviewDto: UpdateReviewDto): Promise<ReviewDocument> {
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
