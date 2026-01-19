import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto, LoginWithOtpDto } from './dto';
import { successResponse } from '../common/base/base.response';
import * as admin from 'firebase-admin';
import { PasswordUtil } from 'src/common/utils';
import { populateUserRoles } from 'src/common/utils/rolePopulat.util';

import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private ordersService: OrdersService,
    private productsService: ProductsService,
  ) {
    // Initialize Firebase Admin only if not already initialized
    if (!admin.apps.length) {
      try {
        // User's Firebase Project ID: otp-projects-5f433
        const projectId = 'otp-projects-5f433';
        admin.initializeApp({
          projectId: projectId,
        });

        console.log(`Firebase Admin SDK initialized for project: ${projectId}`);
      } catch (error) {
        console.error('Error initializing Firebase Admin:', error);
      }
    }
  }


  async createAdmin(adminData: any) {
    // register admin with psswrod encryption
    const { password } = adminData;
    const encryptedPassword = PasswordUtil.encryptPassword(password);
    const userData = {
      ...adminData,
      password: encryptedPassword,
      role: [1], // admin role
    };

    const user = await this.usersService.create(userData);
    const userObj = user.toObject();

    return successResponse(
      userObj,
      'Admin user created successfully',
      201,
    );
  }




  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByUsername(loginDto.username);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const decryptedPassword = PasswordUtil.decryptPassword(user.password);
    if (decryptedPassword !== loginDto.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userObj = user.toObject();

    // populate role
    const allUsers = [userObj];
    await populateUserRoles(this.usersService.userRoleModel, allUsers);

    // After populateUserRoles, userObj.role is now an array of populated role objects
    const role = userObj.role;

    const payload = {
      id: user._id,
      username: user.username,
      role,
      status: userObj.status,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '7d', // 7 days expiry
    });

    return successResponse(
      {
        ...userObj,
        access_token: accessToken,
        role,
      },
      'Login successful',
      200,
    );
  }

  async loginWithOtp({ phone_number, otp }: LoginWithOtpDto) {
    if (otp !== '1234') {
      throw new UnauthorizedException('Invalid OTP');
    }

    let user = await this.usersService.findByPhone(phone_number);

    if (!user) {
      try {
        user = await this.usersService.create({
          phone_number,
          role: [1, 2],
        } as any);
      } catch (error) {
        // Handle race condition: if user was created by another request in the meantime
        if (
          (error as Error).message.includes(
            'User with this phone number already exists',
          )
        ) {
          user = await this.usersService.findByPhone(phone_number);
          if (!user) {
            throw error; // If still not found, rethrow the original error
          }
        } else {
          throw error;
        }
      }
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

  async adminLogin(loginDto: LoginDto) {
    // Same as regular login, just send OTP
    // Admin users will be identified during OTP verification
    return successResponse({}, 'OTP sent successfully', 200);
  }

  async adminVerifyOtp({ phone_number, otp }: LoginWithOtpDto) {
    if (otp !== '1234') {
      throw new UnauthorizedException('Invalid OTP');
    }

    let user = await this.usersService.findByPhone(phone_number);

    if (!user) {
      // Create new admin user with role = 1
      try {
        user = await this.usersService.create({
          phone_number,
          role: [1], // Admin role
        } as any);
      } catch (error) {
        // Handle race condition
        if (
          (error as Error).message.includes(
            'User with this phone number already exists',
          )
        ) {
          user = await this.usersService.findByPhone(phone_number);
          if (!user) {
            throw error;
          }
        } else {
          throw error;
        }
      }
    } else {
      // Check if existing user has admin role
      const userObj = user.toObject();
      if (!userObj.role || !Array.isArray(userObj.role) || !userObj.role.includes(1)) {
        throw new UnauthorizedException('Access denied. Admin privileges required.');
      }
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
      'Admin login successful',
      200,
    );
  }


  async getAdmins() {
    // Fetch users with role 1
    const admins = await this.usersService.findAdmins();

    return successResponse(
      admins,
      'Admin users fetched successfully',
      200,
    );
  }

  async getDashboardStats() {
    const orderStats = await this.ordersService.getOrderStats();
    const userStats = await this.usersService.getUserStats();
    const recentProducts = await this.productsService.getRecentProducts(5);

    return successResponse(
      {
        orders: orderStats,
        users: userStats,
        recent_products: recentProducts,
      },
      'Dashboard stats fetched successfully',
      200,
    );
  }

  // async validateUser(email: string, password: string): Promise<any> {
  //   const user = await this.usersService.verifyPassword(email, password);
  //   if (user) {
  //     const userObj = user.toObject();
  //     if (userObj.status === 'active') {
  //       // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //       const { password: _password, ...result } = userObj;
  //       return result;
  //     }
  //   }
  //   return null;
  // }
}
