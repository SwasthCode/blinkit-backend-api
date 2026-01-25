
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto';
import { successResponse } from '../common/base/base.response';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BaseController } from '../common/base/base.controller';
import { InvoiceDocument } from '../schemas/invoice.schema';

@ApiTags('Invoices')
@Controller('invoices')
export class InvoicesController extends BaseController<InvoiceDocument> {
  constructor(private readonly invoicesService: InvoicesService) {
    super(invoicesService);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authentication')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create (Generate) an invoice for an order' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  async create(@Body() createInvoiceDto: CreateInvoiceDto) {
    const data = await this.invoicesService.create(createInvoiceDto);
    return successResponse(data, 'Invoice created successfully', 201);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authentication')
  @ApiOperation({ summary: 'Get all invoices' })
  async findAll(@Query() query: any) {
    const data = await this.invoicesService.findAll(query);
    return successResponse(data, 'Invoices fetched successfully');
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authentication')
  @ApiOperation({ summary: 'Get invoice by Order ID' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  async findByOrder(@Param('orderId') orderId: string) {
    const data = await this.invoicesService.findByOrder(orderId);
    return successResponse(data, 'Invoice fetched successfully');
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authentication')
  @ApiOperation({ summary: 'Get invoice details' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  async findOne(@Param('id') id: string) {
      // Use base or service method
    const data = await this.invoicesService.findOne(id);
    return successResponse(data, 'Invoice details fetched successfully');
  }
}
