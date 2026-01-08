import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banner, BannerDocument } from '../schemas/banner.schema';
import { BaseService } from '../common/base/base.service';
import { CreateBannerDto } from './dto/create-banner.dto';

@Injectable()
export class BannersService extends BaseService<BannerDocument> {
  constructor(@InjectModel(Banner.name) bannerModel: Model<BannerDocument>) {
    super(bannerModel);
  }

  async findActiveBanners(): Promise<BannerDocument[]> {
    return this.model.find({ status: 'active' }).sort({ priority: -1 }).exec();
  }

  async createBanner(
    createBannerDto: CreateBannerDto,
  ): Promise<BannerDocument> {
    const created = new this.model(createBannerDto);
    return created.save();
  }
}
