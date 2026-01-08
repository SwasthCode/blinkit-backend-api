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

  /**
   * Override create method to handle optional password
   * @param createUserDto - User data
   * @returns Promise<UserDocument> - Created user
   */
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
      const userData = {
        ...createUserDto,
        password: encryptedPassword,
        role: createUserDto.role || 'user',
        status: createUserDto.status || 'active',
      };

      // Create and save the user
      const created = new this.model(userData);
      return created.save();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create user: ${errorMessage}`);
    }
  }

  /**
   * Find user by phone number
   * @param phone_number - User phone number
   * @returns Promise<UserDocument | null>
   */
  async findByPhone(phone_number: string): Promise<UserDocument | null> {
    return this.model.findOne({ phone_number }).exec();
  }



  /**
   * Verify user password during login
   * @param email - User email
   * @param plainPassword - Plain text password to verify
   * @returns Promise<UserDocument | null> - User if password is correct, null otherwise
   */
  async verifyPassword(
    email: string,
    plainPassword: string,
  ): Promise<UserDocument | null> {
    try {
      const user = await this.model.findOne({ email }).exec();
      if (!user || !user.password) {
        return null;
      }

      // Decrypt stored password and compare
      const decryptedPassword = PasswordUtil.decryptPassword(user.password);
      if (decryptedPassword === plainPassword) {
        return user;
      }

      return null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Password verification failed: ${errorMessage}`);
    }
  }

  /**
   * Update user password
   * @param userId - User ID
   * @param newPassword - New plain text password
   * @returns Promise<UserDocument> - Updated user
   */
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


  // Additional user-specific methods can be added here
  // The basic CRUD operations are inherited from BaseService
}
