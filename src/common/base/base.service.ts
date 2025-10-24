import { Model, Document } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';

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

  async update(id: string, updateDto: any): Promise<T> {
    const updated = await this.model
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException(`Item not found with ID: ${id}`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.model.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Item not found with ID: ${id}`);
  }
}
