import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto';
import { successResponse } from '../common/base/base.response';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

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
        role: userObj.role,
        status: userObj.status,
      },
      'Login successful',
      200,
    );
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
