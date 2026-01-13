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
import { LoginDto, LoginWithOtpDto } from './dto';
import { PasswordUtil } from '../common/utils';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with Phone Number' })
  @ApiResponse({ status: 200, description: 'Otp sent successfully' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP' })
  @ApiResponse({ status: 200, description: 'Otp sent successfully' })
  async loginWithOtp(@Body() loginWithOtpDto: LoginWithOtpDto) {
    return this.authService.loginWithOtp(loginWithOtpDto);
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
