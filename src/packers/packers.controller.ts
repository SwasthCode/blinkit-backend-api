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

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authentication')
  @ApiOperation({ summary: 'Get all packers' })
  async findAll(@Query() query: any) {
    const data = await this.packersService.findAll(query);
    return successResponse(data, 'Packers fetched successfully');
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authentication')
  @ApiOperation({ summary: 'Get packer details' })
  async findOne(@Param('id') id: string) {
    const data = await this.packersService.findOne(id);
    return successResponse(data, 'Packer details fetched successfully');
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authentication')
  @ApiOperation({ summary: 'Update packer details' })
  async update(@Param('id') id: string, @Body() updatePackerDto: UpdatePackerDto) {
    const data = await this.packersService.update(id, updatePackerDto);
    return successResponse(data, 'Packer updated successfully');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authentication')
  @ApiOperation({ summary: 'Delete a packer' })
  async remove(@Param('id') id: string) {
    await this.packersService.remove(id);
    return successResponse(null, 'Packer deleted successfully');
  }
}
