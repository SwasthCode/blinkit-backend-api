import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';
import { PasswordUtil } from '../common/utils';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('decrypt-password/:encryptedPassword')
  @HttpCode(HttpStatus.OK)
  decryptPassword(@Param('encryptedPassword') encryptedPassword: string) {
    try {
      const decryptedPassword = PasswordUtil.decryptPassword(encryptedPassword);
      return {
        success: true,
        code: 200,
        message: 'Password decrypted successfully',
        data: {
          encryptedPassword: encryptedPassword,
          decryptedPassword: decryptedPassword,
        },
      };
    } catch {
      return {
        success: false,
        code: 400,
        message: 'Failed to decrypt password',
        data: null,
      };
    }
  }
}
