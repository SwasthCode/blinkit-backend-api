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
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { BaseService } from './base.service';
import { successResponse } from './base.response';

export class BaseController<T extends Document> {
  constructor(protected readonly baseService: BaseService<T>) {}

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
  @ApiOperation({ summary: 'Get all entities' })
  @ApiResponse({ status: 200, description: 'List of all entities' })
  async findAll() {
    const data = await this.baseService.findAll();
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

  // Filter API
  @Get()
  @ApiOperation({ summary: 'Filter entities based on query parameters' })
  @ApiResponse({
    status: 200,
    description: 'Filtered data fetched successfully',
  })
  @ApiQuery({
    name: 'filters',
    required: false,
    description: 'Query parameters for filtering',
    type: Object,
  })
  async filter(@Query() filters: Record<string, unknown>) {
    const data = await this.baseService.filter(filters);
    return successResponse(data, 'Filtered data fetched successfully');
  }

  // SELECT API
  @Get('select')
  @ApiOperation({ summary: 'Select specific fields from entity' })
  @ApiResponse({
    status: 200,
    description: 'Selected fields fetched successfully',
  })
  @ApiQuery({
    name: 'fields',
    required: true,
    description: 'Comma-separated field names',
  })
  async select(@Query('fields') fields: string) {
    const data = await this.baseService.select(fields);
    return successResponse(data, 'Selected fields fetched successfully');
  }

  // X token API

  @Post('check-token')
  @ApiOperation({ summary: 'Check x-token from body' })
  @ApiResponse({ status: 200, description: 'Token validated successfully' })
  checkToken(@Body('xToken') xToken: string) {
    if (!xToken) {
      return successResponse(null, 'xToken is required', 400);
    }

    return successResponse({ xToken }, 'xToken received successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update entity by ID' })
  @ApiParam({ name: 'id', description: 'Entity ID' })
  @ApiResponse({ status: 200, description: 'Entity updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  async update(@Param('id') id: string, @Body() updateDto: Partial<T>) {
    const data = await this.baseService.update(id, updateDto);
    return successResponse(data, 'Updated successfully');
  }

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
