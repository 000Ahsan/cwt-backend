import { IsOptional, IsString, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { BillingStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BillingFilterDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    workerId?: string;

    @ApiPropertyOptional({ enum: BillingStatus })
    @IsOptional()
    @IsEnum(BillingStatus)
    status?: BillingStatus;

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
