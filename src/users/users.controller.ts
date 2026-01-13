import {
  Controller,
  Body,
  Param,
  Post,
  Put,
  HttpCode,
  Get,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { BaseController } from '../common/base/base.controller';
import { UserDocument } from '../schemas/user.schema';
import { successResponse } from '../common/base/base.response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
export class UsersController extends BaseController<UserDocument> {
  constructor(private readonly usersService: UsersService) {
    super(usersService);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  async create(@Body() createUserDto: CreateUserDto) {
    const data = await this.usersService.create(createUserDto);
    return successResponse(data, 'User created successfully', 201);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile fetched successfully',
  })
  async getProfile(@Req() req: any) {
    const data = await this.usersService.getProfile(req.user._id);
    return successResponse(data, 'User profile fetched successfully');
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('profile_image'))
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
  })
  async updateProfile(
    @Req() req: any,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      updateUserDto.profile_image = `/uploads/${file.filename}`;
    }
    const data = await this.usersService.updateProfile(
      req.user._id,
      updateUserDto,
    );
    return successResponse(data, 'User profile updated successfully');
  }

  // @Post('verify-password')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Verify user password' })
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       email: { type: 'string', example: 'john.doe@example.com' },
  //       password: { type: 'string', example: 'SecurePassword123!' },
  //     },
  //     required: ['email', 'password'],
  //   },
  // })
  // @ApiResponse({ status: 200, description: 'Password verification successful' })
  // @ApiResponse({ status: 401, description: 'Invalid credentials' })
  // async verifyPassword(@Body() body: { email: string; password: string }) {
  //   const user = await this.usersService.verifyPassword(
  //     body.email,
  //     body.password,
  //   );
  //   if (user) {
  //     return successResponse(
  //       {
  //         user: {
  //           id: user._id,
  //           email: user.email,
  //           first_name: user.first_name,
  //           last_name: user.last_name,
  //         },
  //       },
  //       'Password verification successful',
  //     );
  //   } else {
  //     return { success: false, message: 'Invalid credentials' };
  //   }
  // }

  // Update password endpoint
  @Put(':id/password')
  @ApiOperation({ summary: 'Update user password' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        newPassword: { type: 'string', example: 'NewSecurePassword123!' },
      },
      required: ['newPassword'],
    },
  })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid password' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updatePassword(
    @Param('id') id: string,
    @Body() body: { newPassword: string },
  ) {
    const data = await this.usersService.updatePassword(id, body.newPassword);
    return successResponse({ id: data._id }, 'Password updated successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get entity by ID' })
  @ApiParam({ name: 'id', description: 'Entity ID' })
  @ApiResponse({ status: 200, description: 'Entity found' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  async findOne(@Param('id') id: string) {
    return super.findOne(id);
  }
}
