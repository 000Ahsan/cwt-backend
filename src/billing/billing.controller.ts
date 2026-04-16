import { Controller, Get, Patch, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { GenerateContractorBillingDto } from './dto/generate-contractor-billing.dto';
import { BillingFilterDto } from './dto/billing-filter.dto';

@ApiTags('Billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get()
  @Roles(Role.CONTRACTOR)
  @ApiOperation({ summary: 'Get billing records' })
  async getBillingRecords(@Request() req, @Query() query: BillingFilterDto) {
    return this.billingService.getBillingRecords(req.user.userId, query);
  }

  @Get('stats')
  @Roles(Role.CONTRACTOR)
  @ApiOperation({ summary: 'Get billing stats' })
  async getStats(@Request() req, @Query() query: BillingFilterDto) {
    return this.billingService.getStats(req.user.userId, query);
  }

  @Get('worker')
  @Roles(Role.WORKER)
  @ApiOperation({ summary: 'Get worker billing records' })
  async getWorkerBillings(@Request() req, @Query() query: BillingFilterDto) {
    return this.billingService.getWorkerBillings(req.user.userId, query);
  }

  @Get('worker/stats')
  @Roles(Role.WORKER)
  @ApiOperation({ summary: 'Get worker billing stats' })
  async getWorkerStats(@Request() req, @Query() query: BillingFilterDto) {
    return this.billingService.getWorkerStats(req.user.userId, query);
  }

  @Patch(':id/pay')
  @Roles(Role.CONTRACTOR)
  @ApiOperation({ summary: 'Mark billing record as paid' })
  async markPaid(@Request() req, @Param('id') id: string) {
    return this.billingService.markPaid(id, req.user.userId);
  }

  @Post('preview-batch')
  @Roles(Role.CONTRACTOR)
  @ApiOperation({ summary: 'Preview batch billing generation for project and contractor work' })
  async previewBatchBilling(@Request() req, @Body() dto: GenerateContractorBillingDto) {
    return this.billingService.getBatchBillingPreview(req.user.userId, dto);
  }

  @Post('generate-batch')
  @Roles(Role.CONTRACTOR)
  @ApiOperation({ summary: 'Generate collective/batch billing record' })
  async generateBatchBilling(@Request() req, @Body() dto: GenerateContractorBillingDto) {
    return this.billingService.createBatchBilling(req.user.userId, dto);
  }

  @Get(':id/details')
  @Roles(Role.CONTRACTOR)
  @ApiOperation({ summary: 'Get detailed billing record with work logs summary' })
  async getBillingDetails(@Request() req, @Param('id') id: string) {
    return this.billingService.getBillingDetails(id, req.user.userId);
  }

  @Delete(':id')
  @Roles(Role.CONTRACTOR)
  @ApiOperation({ summary: 'Delete an unpaid billing record' })
  async deleteBilling(@Request() req, @Param('id') id: string) {
    return this.billingService.deleteBilling(id, req.user.userId);
  }
}
