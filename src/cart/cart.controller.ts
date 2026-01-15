import {
    Controller,
    Get,
    Post,
    Body,
    Delete,
    UseGuards,
    Req,
    Param,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, RemoveFromCartDto } from './dto';
import { successResponse } from '../common/base/base.response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Add To Cart')
@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('authentication')
    @ApiOperation({ summary: 'Get user cart' })
    async getCart(@Req() req: any) {
        const data = await this.cartService.getCart(req.user._id);
        return successResponse(data, 'Cart fetched successfully');
    }

    @Post('add')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('authentication')
    @ApiOperation({ summary: 'Add item to cart' })
    async addToCart(@Req() req: any, @Body() addToCartDto: AddToCartDto) {
        const data = await this.cartService.addToCart(req.user._id, addToCartDto);
        return successResponse(data, 'Item added to cart');
    }

    @Post('remove')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('authentication')
    @ApiOperation({ summary: 'Remove item from cart' })
    async removeFromCart(@Req() req: any, @Body() body: RemoveFromCartDto) {
        const data = await this.cartService.removeFromCart(req.user._id, body.product_id);
        return successResponse(data, 'Item removed from cart');
    }

    @Delete()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('authentication')
    @ApiOperation({ summary: 'Clear cart' })
    async clearCart(@Req() req: any) {
        await this.cartService.clearCart(req.user._id);
        return successResponse([], 'Cart cleared');
    }
}
