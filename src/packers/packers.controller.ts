import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PackersService } from './packers.service';
import { CreatePackerDto, UpdatePackerDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { successResponse } from '../common/base/base.response';
import { BaseController } from '../common/base/base.controller';
import { PackerDocument } from '../schemas/packer.schema';

@ApiTags('Packers')
@Controller('packers')
export class PackersController extends BaseController<PackerDocument> {
  constructor(private readonly packersService: PackersService) {
    super(packersService);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authentication')
  @ApiOperation({ summary: 'Create a new packer' })
  @ApiResponse({ status: 201, description: 'Packer created successfully' })
  async create(@Body() createPackerDto: CreatePackerDto) {
    const data = await this.packersService.create(createPackerDto);
    return successResponse(data, 'Packer created successfully', 201);
  }
}
