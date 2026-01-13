// src/common/base/base.controller.ts
import {
  Body,
  Delete,
  Get,
  Param,
  Post,
  Put,
  HttpCode,
  HttpStatus,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { BaseService } from './base.service';
import { successResponse } from './base.response';
import { UpdateUserDto } from 'src/users/dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';


export class BaseController<T extends Document> {
  constructor(protected readonly baseService: BaseService<T>) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new entity' })
  @ApiResponse({ status: 201, description: 'Entity created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  async create(@Body() createDto: any) {
    const data = await this.baseService.create(createDto);
    return successResponse(data, 'Created successfully', 201);
  }

  @Get()
  @ApiOperation({ summary: 'Get all entities with advanced filtering, sorting, and pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of entities',
  })
  @ApiQuery({ name: 'filter', required: false, type: String, description: 'JSON string filter, e.g. {"status":"active"}' })
  @ApiQuery({ name: 'select', required: false, type: String, description: 'Fields to select (comma/space separated), e.g. "name email"' })
  @ApiQuery({ name: 'sort', required: false, type: String, description: 'Sort order (JSON or fields), e.g. {"createdAt":-1} or "createdAt -name"' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit the number of results, e.g. 10' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Skip a number of results (offset), e.g. 20' })
  async findAll(
    @Query('filter') filter?: string,
    @Query('select') select?: string,
    @Query('sort') sort?: string,
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
  ) {
    const data = await this.baseService.findAll({
      filter,
      select,
      sort,
      limit,
      skip,
    });
    return successResponse(data, 'Data fetched successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get entity by ID' })
  @ApiParam({ name: 'id', description: 'Entity ID' })
  @ApiResponse({ status: 200, description: 'Entity found' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  async findOne(@Param('id') id: string) {
    const data = await this.baseService.findOne(id);
    return successResponse(data, 'Record fetched successfully');
  }

  // X token API

  // @Post('check-token')
  // @ApiOperation({ summary: 'Check x-token from body' })
  // @ApiResponse({ status: 200, description: 'Token validated successfully' })
  // checkToken(@Body('xToken') xToken: string) {
  //   if (!xToken) {
  //     return successResponse(null, 'xToken is required', 400);
  //   }

  //   return successResponse({ xToken }, 'xToken received successfully');
  // }

  // @Put(':id')
  // @ApiOperation({ summary: 'Update entity by ID' })
  // @ApiParam({ name: 'id', description: 'Entity ID' })
  // @ApiResponse({ status: 200, description: 'Entity updated successfully' })
  // @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  // @ApiResponse({ status: 404, description: 'Entity not found' })
  // async update(@Param('id') id: string, @Body() updateDto: UpdateUserDto) {
  //   const data = await this.baseService.updateProfile(id, updateDto);
  //   return successResponse(data, 'Updated successfully');
  // }

  // @Put('profile')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth('JWT-auth')
  // @ApiConsumes('multipart/form-data')
  // @UseInterceptors(FileInterceptor('profile_image'))
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       first_name: { type: 'string' },
  //       last_name: { type: 'string' },
  //       email: { type: 'string' },
  //       profile_image: {
  //         type: 'string',
  //         format: 'binary',
  //       },
  //     },
  //   },
  // })
  // async updateProfile(
  //   @Req() req: any,
  //   @Body() updateDto: UpdateUserDto,
  //   @UploadedFile() file?: Express.Multer.File,
  // ) {
  //   if (file) {
  //     updateDto.profile_image = `/uploads/${file.filename}`;
  //   }

  //   const data = await this.baseService.updateProfile(
  //     req.user._id,
  //     updateDto,
  //   );

  //   return successResponse(data, 'Profile updated successfully');
  // }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete entity by ID' })
  @ApiParam({ name: 'id', description: 'Entity ID' })
  @ApiResponse({ status: 200, description: 'Entity deleted successfully' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  async remove(@Param('id') id: string) {
    await this.baseService.remove(id);
    return successResponse(null, 'Deleted successfully');
  }
}
