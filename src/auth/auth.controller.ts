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
import { LoginDto, LoginWithOtpDto, CreateAdminDto } from './dto';
import { PasswordUtil } from '../common/utils';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }


  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new admin user' })
  @ApiBody({ type: CreateAdminDto })
  @ApiResponse({ status: 201, description: 'Admin user created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.authService.createAdmin(createAdminDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with Phone Number' })
  @ApiResponse({ status: 200, description: 'Otp sent successfully' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all admin users' })
  @ApiResponse({ status: 200, description: 'Admin users fetched successfully' })
  async getAdmins() {
    return this.authService.getAdmins();
  }

  @Get('dashboard')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get dashboard stats' })
  @ApiResponse({ status: 200, description: 'Dashboard stats fetched successfully' })
  async getDashboardStats() {
    return this.authService.getDashboardStats();
  }

  // @Post('verify-otp')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Verify OTP' })
  // @ApiResponse({ status: 200, description: 'Otp sent successfully' })
  // async loginWithOtp(@Body() loginWithOtpDto: LoginWithOtpDto) {
  //   return this.authService.loginWithOtp(loginWithOtpDto);
  // }

  // @Post('admin/login')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Admin Login - Send OTP to Phone Number' })
  // @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  // async adminLogin(@Body() loginDto: LoginDto) {
  //   return this.authService.adminLogin(loginDto);
  // }

  // @Post('admin/verify-otp')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Admin Verify OTP and Login' })
  // @ApiResponse({ status: 200, description: 'Admin login successful' })
  // @ApiResponse({ status: 401, description: 'Invalid OTP or not an admin user' })
  // async adminVerifyOtp(@Body() loginWithOtpDto: LoginWithOtpDto) {
  //   return this.authService.adminVerifyOtp(loginWithOtpDto);
  // }





  // @Get('decrypt-password/:encryptedPassword')
  // @HttpCode(HttpStatus.OK)
  // decryptPassword(@Param('encryptedPassword') encryptedPassword: string) {
  //   try {
  //     const decryptedPassword = PasswordUtil.decryptPassword(encryptedPassword);
  //     return {
  //       success: true,
  //       code: 200,
  //       message: 'Password decrypted successfully',
  //       data: {
  //         encryptedPassword: encryptedPassword,
  //         decryptedPassword: decryptedPassword,
  //       },
  //     };
  //   } catch {
  //     return {
  //       success: false,
  //       code: 400,
  //       message: 'Failed to decrypt password',
  //       data: null,
  //     };
  //   }
  // }
}
