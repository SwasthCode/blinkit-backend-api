import {
  Controller,
  Body,
  Param,
  Post,
  Put,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { BaseController } from '../common/base/base.controller';
import { RoleDocument } from '../schemas/role.schema';
import { successResponse } from '../common/base/base.response';

@ApiTags('roles')
@Controller('roles')
export class RolesController extends BaseController<RoleDocument> {
  constructor(private readonly rolesService: RolesService) {
    super(rolesService);
  }

  // Override create method with proper DTO type and Swagger documentation
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new role (auto-generates key, role_id, and role_type)',
  })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully with auto-generated fields',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Role with same name already exists',
  })
  async create(@Body() createRoleDto: CreateRoleDto) {
    const data = await this.rolesService.create(createRoleDto);
    return successResponse(data, 'Role created successfully', 201);
  }

  // Override update method with proper DTO type and Swagger documentation
  @Put(':id')
  @ApiOperation({ summary: 'Update role by ID with duplicate checking' })
  @ApiParam({ name: 'id', description: 'Role MongoDB ID' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({
    status: 409,
    description:
      'Conflict - Role with same name, key, or role_id already exists',
  })
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    const data = await this.rolesService.update(id, updateRoleDto);
    return successResponse(data, 'Role updated successfully');
  }

  // Find role by key
  @Get('key/:key')
  @ApiOperation({ summary: 'Find role by key' })
  @ApiParam({ name: 'key', description: 'Role key' })
  @ApiResponse({ status: 200, description: 'Role found' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findByKey(@Param('key') key: string) {
    const role = await this.rolesService.findByKey(key);
    if (!role) {
      return successResponse(null, 'Role not found');
    }
    return successResponse(role, 'Role fetched successfully');
  }

  // Find role by numeric ID
  @Get('numeric/:id')
  @ApiOperation({ summary: 'Find role by numeric ID' })
  @ApiParam({ name: 'id', description: 'Role numeric ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Role found' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findByNumericId(@Param('id') id: string) {
    const numericId = parseInt(id, 10);
    const role = await this.rolesService.findByNumericId(numericId);
    if (!role) {
      return successResponse(null, 'Role not found');
    }
    return successResponse(role, 'Role fetched successfully');
  }

  // Find roles by role type
  @Get('type/:roleType')
  @ApiOperation({ summary: 'Find roles by role type' })
  @ApiParam({
    name: 'roleType',
    description: 'Role type number',
    type: 'number',
  })
  @ApiResponse({ status: 200, description: 'Roles found' })
  async findByRoleType(@Param('roleType') roleType: string) {
    const type = parseInt(roleType, 10);
    const roles = await this.rolesService.findByRoleType(type);
    return successResponse(roles, 'Roles fetched successfully');
  }

  // Additional role-specific endpoints can be added here
  // Other CRUD operations are inherited from BaseController
}
