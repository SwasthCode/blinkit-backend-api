import {
  Controller,
  Body,
  Param,
  Post,
  Put,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { BaseController } from '../common/base/base.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserDocument } from '../schemas/user.schema';
import { successResponse } from '../common/base/base.response';

@ApiTags('users')
@Controller('users')
export class UsersController extends BaseController<UserDocument> {
  constructor(private readonly usersService: UsersService) {
    super(usersService);
  }

  // Override create method with proper DTO type and Swagger documentation
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

  // Override update method with proper DTO type and Swagger documentation
  @Put(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const data = await this.usersService.update(id, updateUserDto);
    return successResponse(data, 'User updated successfully');
  }

  // Password verification endpoint
  @Post('verify-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify user password' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'john.doe@example.com' },
        password: { type: 'string', example: 'SecurePassword123!' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiResponse({ status: 200, description: 'Password verification successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async verifyPassword(@Body() body: { email: string; password: string }) {
    const user = await this.usersService.verifyPassword(
      body.email,
      body.password,
    );
    if (user) {
      return successResponse(
        {
          user: {
            id: user._id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
          },
        },
        'Password verification successful',
      );
    } else {
      return { success: false, message: 'Invalid credentials' };
    }
  }

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

  // Get current user profile (protected route)
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req: { user: { _id: string } }) {
    const user = await this.usersService.findOne(req.user._id);
    return successResponse(user, 'User profile retrieved successfully');
  }

  // Additional user-specific endpoints can be added here
  // Other CRUD operations are inherited from BaseController
}
