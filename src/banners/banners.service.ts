import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from '../common/base/base.service';
import { Banner, BannerDocument } from '../schemas/banner.schema';
import { FirebaseService } from '../common/firebase/firebase.service';

@Injectable()
export class BannersService extends BaseService<BannerDocument> {
  constructor(
    @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
    private readonly firebaseService: FirebaseService,
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
      const imageUrl = await this.firebaseService.uploadFile(file, 'banners');
      createBannerDto['image_url'] = imageUrl;
    }
    const createdBanner = new this.bannerModel(createBannerDto);
    return createdBanner.save();
  }

  async update(
    id: string,
    updateBannerDto: any,
    file?: Express.Multer.File,
  ): Promise<BannerDocument> {
    if (file) {
      const imageUrl = await this.firebaseService.uploadFile(file, 'banners');
      updateBannerDto['image_url'] = imageUrl;
    }

    const updatedBanner = await this.bannerModel
      .findByIdAndUpdate(id, updateBannerDto, { new: true })
      .exec();

    if (!updatedBanner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }

    return updatedBanner;
  }
}
