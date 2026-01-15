import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Req,
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
import { CreateOrderDto } from './dto';
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
    @ApiOperation({ summary: 'Place an order from cart' })
    @ApiResponse({ status: 201, description: 'Order placed successfully' })
    async create(@Req() req: any, @Body() createOrderDto: CreateOrderDto) {
        const data = await this.ordersService.placeOrder(req.user._id, createOrderDto);
        return successResponse(data, 'Order placed successfully', 201);
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
}
