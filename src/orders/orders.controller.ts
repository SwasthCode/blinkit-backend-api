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
import { CreateDirectOrderDto, UpdateOrderStatusDto } from './dto';
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
  // @ts-ignore
  async create(
    @Body() createDirectOrderDto: CreateDirectOrderDto,
    @Req() req: any,
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

  @Get()
  @ApiOperation({ summary: 'Get all orders with filters' })
  async findAll(@Query() query: any) {
    const data = await this.ordersService.findAllWithFilters(query);
    return successResponse(data, 'Orders fetched successfully');
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('my-picks')
  @ApiOperation({ summary: 'Get assigned orders for picker' })
  async getMyPicks(@Req() req: any) {
    const userId = req.user._id;
    const data = await this.ordersService.getMyPicks(userId.toString());
    return successResponse(data, 'My pick assignments fetched successfully');
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: 'Update order (status, items, or total_amount)' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  async update(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @Req() req?: any,
  ) {
    const data = await this.ordersService.updateOrder(
      id,
      updateOrderStatusDto,
      req?.user,
    );
    return successResponse(data, 'Order updated successfully');
  }
}
