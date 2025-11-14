import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from './dto';
import { BaseService } from '../common/base/base.service';
import { PasswordUtil } from '../common/utils';

@Injectable()
export class UsersService extends BaseService<UserDocument> {
  constructor(@InjectModel(User.name) userModel: Model<UserDocument>) {
    super(userModel);
  }

  /**
   * Override create method to encrypt password before saving
   * @param createUserDto - User data including plain text password
   * @returns Promise<UserDocument> - Created user with encrypted password
   */
  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    try {
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
      const encryptedPassword = PasswordUtil.encryptPassword(
        createUserDto.password,
      );

      // Create user data with encrypted password and default values
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
      throw new Error(`Failed to create user: ${error.message}`);
    }
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
      if (!user) {
        return null;
      }

      // Decrypt stored password and compare
      const decryptedPassword = PasswordUtil.decryptPassword(user.password);
      if (decryptedPassword === plainPassword) {
        return user;
      }

      return null;
    } catch (error) {
      throw new Error(`Password verification failed: ${error.message}`);
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
      throw new Error(`Failed to update password: ${error.message}`);
    }
  }

  // Additional user-specific methods can be added here
  // The basic CRUD operations are inherited from BaseService
}
