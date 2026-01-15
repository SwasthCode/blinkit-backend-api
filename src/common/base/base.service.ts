import { Model, Document } from 'mongoose';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import * as jwt from 'jsonwebtoken';
import { UpdateUserDto } from 'src/users/dto';

@Injectable()
export class BaseService<T extends Document> {
  constructor(protected readonly model: Model<T>

  ) { }

  async create(createDto: any): Promise<T> {
    const created = new this.model(createDto);
    return created.save();
  }

  async findAll(options: {
    filter?: string;
    select?: string;
    sort?: string;
    limit?: number;
    skip?: number;
  }): Promise<T[]> {
    const { filter, select, sort, limit, skip } = options;

    // Parse filter
    let query = {};
    if (filter) {
      try {
        query = JSON.parse(filter);
        // Basic sanitization or transformation could go here if needed
        // For regex search support in JSON, we might need a custom parser or convention
        // For now, assuming standard MongoDB query object structure
      } catch (e) {
        // Fallback for simple key-value if not JSON, or just ignore (or throw)
        console.warn('Invalid JSON filter:', filter);
      }
    }

    // Parse sort
    let sortOptions: any = {};
    if (sort) {
      try {
        sortOptions = JSON.parse(sort);
      } catch (e) {
        // Handle "field" or "-field" string format
        sortOptions = sort;
      }
    }

    let q = this.model.find(query);

    if (select) {
      q = q.select(select.split(',').join(' '));
    }

    if (sortOptions) {
      q = q.sort(sortOptions);
    }

    if (skip) {
      q = q.skip(Number(skip));
    }

    if (limit) {
      q = q.limit(Number(limit));
    }

    return q.exec();
  }

  async findOne(id: string): Promise<T> {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`Item not found with ID: ${id}`);
    return doc;
  }

  // TOKEN CHECK LOGIC
  async checkToken(xToken: string): Promise<any> {
    if (!xToken) {
      throw new UnauthorizedException('xToken is required');
    }

    let decoded: { userId?: string };
    try {
      decoded = jwt.verify(
        xToken,
        process.env.JWT_SECRET || 'defaultSecret',
      ) as { userId?: string };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const tokenExists = await this.model.findOne({ token: xToken }).exec();
    if (!tokenExists) {
      throw new UnauthorizedException('Token not found in database');
    }

    if (!this.model) {
      throw new Error('User model not injected in BaseService');
    }

    if (!decoded.userId) {
      throw new UnauthorizedException('Token does not contain userId');
    }
    const user = await this.model.findById(decoded.userId).exec();
    if (!user) {
      throw new NotFoundException('User not found for this token');
    }

    return {
      token: xToken,
      decodedData: decoded,
      user,
      isValid: true,
      message: 'Token authenticated successfully',
    };
  }

  async updateProfile(userId: string, updateDto: UpdateUserDto) {
    const user = await this.model.findByIdAndUpdate(
      userId,
      { $set: updateDto },
      { new: true, runValidators: true },
    );

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.model.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Item not found with ID: ${id}`);
  }
}
