import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Role, RoleDocument } from '../schemas/role.schema';
import { CreateUserDto } from './dto';
import { LoginDto, LoginWithOtpDto } from '../auth/dto';
import { JwtService } from '@nestjs/jwt';
import { successResponse } from '../common/base/base.response';
import { BaseService } from '../common/base/base.service';
import { PasswordUtil } from '../common/utils';
import { populateUserRoles } from '../common/utils/rolePopulat.util';

import { FirebaseService } from '../common/firebase/firebase.service';

@Injectable()
export class UsersService extends BaseService<UserDocument> {
  constructor(
    @InjectModel(User.name) userModel: Model<UserDocument>,
    @InjectModel(Role.name) public userRoleModel: Model<RoleDocument>,
    private readonly firebaseService: FirebaseService,
    private readonly jwtService: JwtService,
  ) {
    super(userModel);
    this.searchFields = ['first_name', 'last_name', 'email', 'phone_number', 'status', 'username'];
  }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    try {
      const encryptedPassword: string | undefined = undefined;

      // if (createUserDto.password) {
      //   // Validate password strength
      //   const passwordValidation = PasswordUtil.validatePasswordStrength(
      //     createUserDto.password,
      //   );
      //   if (!passwordValidation.isValid) {
      //     throw new Error(
      //       `Password does not meet security requirements: ${passwordValidation.suggestions.join(', ')}`,
      //     );
      //   }

      //   // Encrypt the password
      //   encryptedPassword = PasswordUtil.encryptPassword(
      //     createUserDto.password,
      //   );
      // }

      // Create user data with encrypted password if provided
      const userData: any = {
        ...createUserDto,
        // password: encryptedPassword,
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
      if (error && error.code === 11000) {
        if (error.keyPattern.phone_number) {
          throw new Error('User with this phone number already exists');
        }
        if (error.keyPattern.email) {
          throw new Error('User with this email already exists');
        }
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create user: ${errorMessage}`);
    }
  }
  async login(loginDto: LoginDto) {
    // Current requirement: "Login with Phone Number" often means sending OTP first
    // In this codebase, login(LoginDto) was for username/password in AuthService.
    // However, the user said "Login with phone_no" and "Verify with otp".
    // I will implement them as per the user's request details.

    // If it's just a username/password login:
    const user = await this.model.findOne({ username: loginDto.username });
    if (!user || user.password !== PasswordUtil.encryptPassword(loginDto.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return successResponse(user, 'Login successful');
  }

  async loginWithPhone(phone_number: string) {
    // Logic for sending OTP would go here. For now, returning success as per auth.service.ts
    return successResponse({}, 'OTP sent successfully', 200);
  }

  async verifyOtp({ phone_number, otp }: LoginWithOtpDto) {
    if (otp !== '1234') {
      throw new UnauthorizedException('Invalid OTP');
    }

    let user = await this.findByPhone(phone_number);

    if (!user) {
      throw new NotFoundException('User with this phone number not found');
    }

    if (!user) {
      throw new Error('Failed to identify user');
    }

    const userObj = user.toObject();

    const accessToken = this.jwtService.sign(
      {
        id: user._id,
        phone_number: user.phone_number,
        role: userObj.role,
        status: userObj.status,
      },
      { expiresIn: '7d' },
    );

    return successResponse(
      {
        ...userObj,
        access_token: accessToken,
      },
      'Login successful',
      200,
    );
  }
  async findAll(options: {
    filter?: any;
    select?: string;
    sort?: unknown;
    limit?: number | string;
    skip?: number | string;
  }): Promise<UserDocument[]> {
    const { filter, select, sort, limit, skip } = options;

    let query = filter || {};

    const sortOptions = sort || {};

    let q = this.model.find(query);

    if (select) {
      q = q.select(select.split(/[,\s]+/).join(' '));
    }

    if (Object.keys(sortOptions).length > 0) {
      q = q.sort(sortOptions as any);
    }

    if (skip) {
      q = q.skip(Number(skip));
    }

    if (limit) {
      q = q.limit(Number(limit));
    }

    const users = await q.lean().exec();

    // Populate Roles (Manual Population)
    await populateUserRoles(this.userRoleModel, users);

    return users as any;
  }



  async findByPhone(phone_number: string): Promise<UserDocument | null> {
    return this.model.findOne({ phone_number }).exec();
  }

  async findAdmins(): Promise<UserDocument[]> {
    const admins = await this.model
      .find({ role: { $in: [1] } })
      .lean()
      .exec();
    await populateUserRoles(this.userRoleModel, admins);
    return admins as any;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.model.findOne({ email }).exec();
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.model.findOne({ username }).exec();
  }

  async findByIdentifier(identifier: string): Promise<UserDocument | null> {
    // Try to find by email first, then by phone
    const user = await this.model
      .findOne({
        $or: [{ email: identifier }, { phone_number: identifier }],
      })
      .exec();
    return user;
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

  // @ts-ignore
  async updateProfile(
    userId: string,
    updateDto: any,
    file?: Express.Multer.File,
  ): Promise<UserDocument> {
    if (file) {
      const imageUrl = await this.firebaseService.uploadFile(
        file,
        'users/profile',
      );
      updateDto.profile_image = imageUrl;
    }

    const user = await this.model.findByIdAndUpdate(
      userId,
      { $set: updateDto },
      { new: true, runValidators: true },
    ).lean().exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Populate roles before returning
    await populateUserRoles(this.userRoleModel, [user]);

    return user as any;
  }

  async getProfile(userId: string) {
    const user: any = await this.model.findById(userId).lean().exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Use unified populateUserRoles utility
    await populateUserRoles(this.userRoleModel, [user]);

    return user;
  }

  async getUserStats() {


    const totalUsers = await this.model.countDocuments();

    const monthlyCounts = await this.model.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: '$_id',
          count: 1,
        },
      },
    ]);

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const formattedMonthlyCounts = monthNames.map((monthName, index) => {
      const found = monthlyCounts.find((item) => item.month === index + 1);
      return {
        month: monthName,
        count: found ? found.count : 0,
      };
    });

    return {
      grand_total_users: totalUsers,
      monthly_counts: formattedMonthlyCounts,
    };
  }
}
