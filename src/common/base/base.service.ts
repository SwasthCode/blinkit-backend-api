import { Model, Document, Types, isValidObjectId } from 'mongoose';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import * as jwt from 'jsonwebtoken';
import { UpdateUserDto } from '../../users/dto';

@Injectable()
export class BaseService<T extends Document> {
  protected searchFields: string[] = [];

  constructor(protected readonly model: Model<T>) {}

  async create(createDto: any): Promise<T> {
    const created = new this.model(createDto);
    return created.save();
  }

  async findAll(options: {
    filter?: string;
    search?: string;
    select?: string;
    sort?: string;
    limit?: number;
    skip?: number;
  }): Promise<T[]> {
    const { filter, search, select, sort, limit, skip } = options;

    // Parse filter
    let query: any = {};
    if (filter) {
      try {
        query = JSON.parse(filter);
      } catch (e) {
        console.warn('Invalid JSON filter:', filter);
      }
    }

    // Apply Search
    if (search && this.searchFields.length > 0) {
      const searchRegex = { $regex: search, $options: 'i' };
      const searchQuery = {
        $or: this.searchFields.map((field) => ({
          [field]: searchRegex,
        })),
      };

      if (Object.keys(query).length > 0) {
        query = { $and: [query, searchQuery] };
      } else {
        query = searchQuery;
      }
    }

    // Parse sort
    let sortOptions: any = {};
    if (sort) {
      try {
        sortOptions = JSON.parse(sort);
      } catch (e) {
        sortOptions = sort;
      }
    }

    let q: any = this.model.find(query);
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
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`Invalid ID format: ${id}`);
    }
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

  async update(id: string, updateDto: any): Promise<T> {
    if (!isValidObjectId(id))
      throw new NotFoundException(`Invalid ID format: ${id}`);
    const updated = await this.model
      .findByIdAndUpdate(id, updateDto, {
        new: true,
        runValidators: true,
      })
      .exec();
    if (!updated) throw new NotFoundException(`Item not found with ID: ${id}`);
    return updated;
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
    if (!isValidObjectId(id))
      throw new NotFoundException(`Invalid ID format: ${id}`);
    const result = await this.model.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Item not found with ID: ${id}`);
  }
}
