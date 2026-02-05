import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import {
  CreateDirectOrderDto,
  UpdateOrderStatusDto,
  CreateShiftDto,
} from './dto';
import { successResponse } from '../common/base/base.response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { BaseController } from '../common/base/base.controller';
import { OrderDocument } from '../schemas/order.schema';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController extends BaseController<OrderDocument> {
  constructor(private readonly ordersService: OrdersService) {
    super(ordersService);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async createDirect(
    @Req() req: any,
    @Body() createDirectOrderDto: CreateDirectOrderDto,
  ) {
    const userId = req.user?._id || createDirectOrderDto.user_id;

    if (!userId) {
      // Ideally throw an error, but for now assuming it's provided as per current non-strict env
      // throw new BadRequestException('User ID is required');
      console.warn('No User ID found in request or body');
    }

    const data = await this.ordersService.createDirectOrder(
      userId,
      createDirectOrderDto,
    );
    return successResponse(data, 'Order created successfully', 201);
  }

  @Post('shift')
  @ApiOperation({ summary: 'Add a shift for delivery' })
  @ApiResponse({ status: 201, description: 'Shift added successfully' })
  async addShift(@Req() req: any, @Body() createShiftDto: CreateShiftDto) {
    const userId = req.user?._id || createShiftDto.user_id;

    if (!userId) {
      return successResponse(null, 'User ID is required in token or body', 400);
    }

    const data = await this.ordersService.addShift(userId, createShiftDto);
    return successResponse(data, 'Shift added successfully', 201);
  }


  @Get('shift')
  @ApiOperation({ summary: 'Get all shifts' })
  @ApiResponse({ status: 200, description: 'Shifts fetched successfully' })
  async getShifts() {
    // Always fetch all shifts
    const data = await this.ordersService.getShifts();
    return successResponse(data, 'Shifts fetched successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders with filters' })
  async findAll(@Query() query: any) {
    const data = await this.ordersService.findAllWithFilters(query);
    return successResponse(data, 'Orders fetched successfully');
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authentication')
  @Get('my-picks')
  @ApiOperation({ summary: 'Get assigned orders for picker' })
  async getMyPicks(@Req() req: any) {
    const userId = req.user._id;
    const data = await this.ordersService.getMyPicks(userId.toString());
    return successResponse(data, 'My pick assignments fetched successfully');
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authentication')
  @Get('my-packs')
  @ApiOperation({ summary: 'Get assigned orders for packer' })
  async getMyPacks(@Req() req: any) {
    const userId = req.user._id;
    const data = await this.ordersService.getMyPacks(userId.toString());
    return successResponse(data, 'My pack assignments fetched successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.ordersService.findOne(id);
    return successResponse(data, 'Order details fetched successfully');
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authentication')
  @Put(':id')
  @ApiOperation({ summary: 'Update order (status, items, or total_amount)' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  async update(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @Req() req?: any,
  ) {
    const data = await this.ordersService.updateOrder(id, updateOrderStatusDto, req?.user);
    return successResponse(data, 'Order updated successfully');
  }
}
