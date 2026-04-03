import { Controller, Get, Patch, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { GenerateContractorBillingDto } from './dto/generate-contractor-billing.dto';

@ApiTags('Billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get()
  @Roles(Role.CONTRACTOR)
  @ApiOperation({ summary: 'Get billing records' })
  async getBillingRecords(@Request() req, @Query() query) {
    return this.billingService.getBillingRecords(req.user.userId, query);
  }

  @Get('stats')
  @Roles(Role.CONTRACTOR)
  @ApiOperation({ summary: 'Get billing stats' })
  async getStats(@Request() req) {
    return this.billingService.getStats(req.user.userId);
  }

  @Patch(':id/pay')
  @Roles(Role.CONTRACTOR)
  @ApiOperation({ summary: 'Mark billing record as paid' })
  async markPaid(@Request() req, @Param('id') id: string) {
    return this.billingService.markPaid(id, req.user.userId);
  }

  @Post('preview-contractor')
  @Roles(Role.CONTRACTOR)
  @ApiOperation({ summary: 'Preview contractor billing generation' })
  async previewContractorBilling(@Request() req, @Body() dto: GenerateContractorBillingDto) {
    return this.billingService.calculateContractorBillingPreview(req.user.userId, dto);
  }

  @Post('generate-contractor')
  @Roles(Role.CONTRACTOR)
  @ApiOperation({ summary: 'Generate contractor residual billing' })
  async generateContractorBilling(@Request() req, @Body() dto: GenerateContractorBillingDto) {
    return this.billingService.generateContractorBilling(req.user.userId, dto);
  }
}
