import { Model, Document } from 'mongoose';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import * as jwt from 'jsonwebtoken';

@Injectable()
export class BaseService<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async create(createDto: any): Promise<T> {
    const created = new this.model(createDto);
    return created.save();
  }

  async findAll(): Promise<T[]> {
    return this.model.find().exec();
  }

  async findOne(id: string): Promise<T> {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`Item not found with ID: ${id}`);
    return doc;
  }

  // New Filter method
  async filter(filters: Record<string, unknown>): Promise<T[]> {
    const query: Record<string, { $regex: RegExp }> = {};

    for (const key in filters) {
      if (filters[key] && typeof filters[key] === 'string') {
        query[key] = { $regex: new RegExp(filters[key], 'i') };
      }
    }

    return await this.model
      .find(query as Parameters<typeof this.model.find>[0])
      .exec();
  }

  // SELECT Logic
  async select(fields: string): Promise<T[]> {
    const projection = fields.split(',').join(' ');
    return await this.model.find({}, projection).exec();
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

  async update(id: string, updateDto: Partial<T>): Promise<T> {
    const updated = await this.model
      .findByIdAndUpdate(
        id,
        updateDto as Parameters<typeof this.model.findByIdAndUpdate>[1],
        { new: true },
      )
      .exec();
    if (!updated) throw new NotFoundException(`Item not found with ID: ${id}`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.model.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Item not found with ID: ${id}`);
  }
}
