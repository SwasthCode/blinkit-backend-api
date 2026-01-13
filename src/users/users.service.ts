import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto, UpdateUserDto } from './dto';
import { BaseService } from '../common/base/base.service';
import { PasswordUtil } from '../common/utils';

@Injectable()
export class UsersService extends BaseService<UserDocument> {
  constructor(@InjectModel(User.name) userModel: Model<UserDocument>) {
    super(userModel);
  }


  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    try {
      let encryptedPassword: string | undefined = undefined;

      if (createUserDto.password) {
        // Validate password strength
        const passwordValidation = PasswordUtil.validatePasswordStrength(
          createUserDto.password,
        );
        if (!passwordValidation.isValid) {
          throw new Error(
            `Password does not meet security requirements: ${passwordValidation.suggestions.join(', ')}`,
          );
        }

        // Encrypt the password
        encryptedPassword = PasswordUtil.encryptPassword(
          createUserDto.password,
        );
      }

      // Create user data with encrypted password if provided
      const userData: any = {
        ...createUserDto,
        password: encryptedPassword,
        // role: createUserDto.role || 'user',
        // status: createUserDto.status || 'active',
      };

      if (!userData.email) {
        delete userData.email;
      }

      // Create and save the user
      const created = new this.model(userData);
      return await created.save();
    } catch (error) {
      if (error && (error as any).code === 11000) {
        if ((error as any).keyPattern.phone_number) {
          throw new Error('User with this phone number already exists');
        }
        if ((error as any).keyPattern.email) {
          throw new Error('User with this email already exists');
        }
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create user: ${errorMessage}`);
    }
  }


  async findByPhone(phone_number: string): Promise<UserDocument | null> {
    return this.model.findOne({ phone_number }).exec();
  }




  // async verifyPassword(
  //   email: string,
  //   plainPassword: string,
  // ): Promise<UserDocument | null> {
  //   try {
  //     const user = await this.model.findOne({ email }).exec();
  //     if (!user || !user.password) {
  //       return null;
  //     }

  //     const decryptedPassword = PasswordUtil.decryptPassword(user.password);
  //     if (decryptedPassword === plainPassword) {
  //       return user;
  //     }

  //     return null;
  //   } catch (error) {
  //     const errorMessage =
  //       error instanceof Error ? error.message : 'Unknown error';
  //     throw new Error(`Password verification failed: ${errorMessage}`);
  //   }
  // }


  async updatePassword(
    userId: string,
    newPassword: string,
  ): Promise<UserDocument> {
    try {
      // Validate password strength
      const passwordValidation =
        PasswordUtil.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(
          `Password does not meet security requirements: ${passwordValidation.suggestions.join(', ')}`,
        );
      }

      // Encrypt the new password
      const encryptedPassword = PasswordUtil.encryptPassword(newPassword);

      // Update the user's password
      const updated = await this.model
        .findByIdAndUpdate(
          userId,
          { password: encryptedPassword },
          { new: true },
        )
        .exec();

      if (!updated) {
        throw new Error(`User not found with ID: ${userId}`);
      }

      return updated;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update password: ${errorMessage}`);
    }


  }


  async getProfile(userId: string) {
    const user = await this.model.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }



}
