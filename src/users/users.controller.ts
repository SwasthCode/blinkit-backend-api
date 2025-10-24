import { Controller, Body, Param, Post, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { BaseController } from '../common/base/base.controller';
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

  // Additional user-specific endpoints can be added here
  // Other CRUD operations are inherited from BaseController
}
