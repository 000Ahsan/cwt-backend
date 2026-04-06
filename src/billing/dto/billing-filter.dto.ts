import { IsOptional, IsString, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { BillingType, BillingStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BillingFilterDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    workerId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    projectId?: string;

    @ApiPropertyOptional({ enum: BillingStatus })
    @IsOptional()
    @IsEnum(BillingStatus)
    status?: BillingStatus;

    @ApiPropertyOptional({ enum: BillingType })
    @IsOptional()
    @IsEnum(BillingType)
    billingType?: BillingType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    page?: string;

    @ApiPropertyOptional()
    @IsOptional()
    limit?: string;
}
