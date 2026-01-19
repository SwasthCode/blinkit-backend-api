import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    });
  }

  async validate(payload: { id: string }) {
    let user;
    try {
      user = await this.usersService.findOne(payload.id);
    } catch (error) {
      throw new UnauthorizedException('User not found');
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const userObj = user.toObject();
    if (userObj.status !== 'active') {
      throw new UnauthorizedException('User account is not active');
    }

    return {
      _id: user._id,
      email: user.email,
      role: userObj.role,
      status: userObj.status,
      first_name: user.first_name,
      last_name: user.last_name,
    };
  }
}
