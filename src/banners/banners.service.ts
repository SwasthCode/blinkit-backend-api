import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '../common/base/base.service';
import { Banner, BannerDocument } from '../schemas/banner.schema';

@Injectable()
export class BannersService extends BaseService<BannerDocument> {
  constructor(
    @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
  ) {
    super(bannerModel);
  }

  async findActive(position?: string): Promise<BannerDocument[]> {
    const query: any = { isActive: true };
    if (position) {
      query.position = position;
    }
    return this.bannerModel.find(query).exec();
  }
  async create(
    createBannerDto: any,
    file?: Express.Multer.File,
  ): Promise<BannerDocument> {
    if (file) {
      createBannerDto['image_url'] = `/uploads/${file.filename}`;
    }
    const createdBanner = new this.bannerModel(createBannerDto);
    return createdBanner.save();
  }

  // async update(id: string, updateBannerDto: any, file?: Express.Multer.File): Promise<BannerDocument> {
  //     if (file) {
  //         updateBannerDto['image_url'] = `/uploads/${file.filename}`;
  //     }

  //     const updatedBanner = await this.bannerModel
  //         .findByIdAndUpdate(id, updateBannerDto, { new: true })
  //         .exec();

  //     if (!updatedBanner) {
  //         // throw new NotFoundException(`Banner with ID ${id} not found`); // Need to import NotFoundException or rely on base if simple
  //     }
  //     return updatedBanner;
  // }
}
