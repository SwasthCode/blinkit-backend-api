import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
    HttpCode,
    HttpStatus,
    UseGuards,
    Req,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto';
import { BaseController } from '../common/base/base.controller';
import { AddressDocument } from '../schemas/address.schema';
import { successResponse } from '../common/base/base.response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Addresses')
@Controller('addresses')
export class AddressesController extends BaseController<AddressDocument> {
    constructor(private readonly addressesService: AddressesService) {
        super(addressesService);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('authentication')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new address' })
    @ApiResponse({ status: 201, description: 'Address created successfully' })
    // @ts-ignore
    async create(
        @Req() req: any,
        @Body() createAddressDto: CreateAddressDto,
    ) {
        console.log('Address Create Headers:', req.headers);
        console.log('Address Create User:', req.user);

        if (!req.user) {
            console.error('User missing in Address Create. Check AuthModule import.');
        }

        const addressData = { ...createAddressDto, user_id: req.user?._id };
        const data = await this.addressesService.create(addressData);
        return successResponse(data, 'Address created successfully', 201);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('authentication')
    @ApiOperation({ summary: 'Get all addresses for logged-in user' })
    async findAll(@Req() req: any) {
        const data = await this.addressesService.findAllByUser(req.user._id);
        return successResponse(data, 'Addresses fetched successfully');
    }

    
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('authentication')
    @ApiOperation({ summary: 'Delete address by ID' })
    async remove(@Param('id') id: string) {
        const data = await this.addressesService.remove(id);
        return successResponse(data, 'Address deleted successfully');
    }
}
