import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto, LoginWithOtpDto } from './dto';
import { successResponse } from '../common/base/base.response';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByPhone(loginDto.phone_number);

    if (!user) {
      // throw new UnauthorizedException('Invalid phone number');
      return successResponse({}, 'Otp sent successfully', 200);
    } else {
      const userObj = user.toObject();
      const role = [10]; // customer
      // if (userObj.status !== 'active') {
      //   throw new UnauthorizedException('User account is not active');
      // }

      const payload = {
        id: user._id,
        phone_number: user.phone_number,
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
          role: 'user',
        } as any);
      } catch (error) {
        // Handle race condition: if user was created by another request in the meantime
        if ((error as Error).message.includes('User with this phone number already exists')) {
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
