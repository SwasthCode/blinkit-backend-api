import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
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
    const user = await this.usersService.verifyPassword(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const userObj = user.toObject();
    if (userObj.status !== 'active') {
      throw new UnauthorizedException('User account is not active');
    }

    const payload = {
      sub: user._id,
      email: user.email,
      phone_number: user.phone_number,
      role: userObj.role,
      status: userObj.status,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '7d', // 7 days expiry
    });

    return successResponse(
      {
        access_token: accessToken,
        _id: user._id,
        email: user.email,
        phone_number: user.phone_number,
        role: userObj.role,
        status: userObj.status,
      },
      'Login successful',
      200,
    );
  }

  async loginWithOtp(loginWithOtpDto: LoginWithOtpDto) {
    try {
      // 1. Verify Firebase Token
      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(loginWithOtpDto.firebase_token);
      } catch (error) {
        console.error('Firebase token verification failed:', error);
        throw new UnauthorizedException('Invalid Firebase token');
      }

      const phoneNumber = decodedToken.phone_number;
      if (!phoneNumber) {
        throw new UnauthorizedException('Phone number not found in token');
      }

      // 2. Find or Create User
      let user = await this.usersService.findByPhone(phoneNumber);
      if (!user) {
        // Register new user if not exists
        // We might want to request more info from frontend, but for now we create a basic user
        user = await this.usersService.create({
          phone_number: phoneNumber,
          first_name: 'User', // Default values
          last_name: phoneNumber.slice(-4),
        } as any);
      }

      const userObj = user.toObject();
      if (userObj.status !== 'active') {
        throw new UnauthorizedException('User account is not active');
      }

      // 3. Generate JWT
      const payload = {
        sub: user._id,
        phone_number: user.phone_number,
        role: userObj.role,
        status: userObj.status,
      };

      const accessToken = this.jwtService.sign(payload, {
        expiresIn: '7d',
      });

      return successResponse(
        {
          access_token: accessToken,
          _id: user._id,
          phone_number: user.phone_number,
          role: userObj.role,
          status: userObj.status,
        },
        'Login successful',
        200,
      );
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException('Login failed: ' + error.message);
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.verifyPassword(email, password);
    if (user) {
      const userObj = user.toObject();
      if (userObj.status === 'active') {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _password, ...result } = userObj;
        return result;
      }
    }
    return null;
  }
}

