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
  CreateOrderDto,
  CreateDirectOrderDto,
  UpdateOrderStatusDto,
} from './dto';
import { successResponse } from '../common/base/base.response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrderDocument } from '../schemas/order.schema';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }


  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authentication')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async createDirect(
    @Req() req: any,
    @Body() createDirectOrderDto: CreateDirectOrderDto,
  ) {
    const data = await this.ordersService.createDirectOrder(
      req.user._id,
      createDirectOrderDto,
    );
    return successResponse(data, 'Order created successfully', 201);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authentication')
  @ApiOperation({ summary: 'Get order history' })
  async findAll(@Req() req: any) {
    const data = await this.ordersService.findByUser(req.user._id);
    return successResponse(data, 'Order history fetched successfully');
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authentication')
  @ApiOperation({ summary: 'Get order details' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.ordersService.findOne(id);
    return successResponse(data, 'Order details fetched successfully');
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authentication')
  @ApiOperation({ summary: 'Update order status' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const data = await this.ordersService.updateStatus(
      id,
      updateOrderStatusDto.status,
    );
    return successResponse(data, 'Order status updated successfully');
  }
}
