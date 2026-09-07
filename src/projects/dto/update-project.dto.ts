import { IsOptional, IsString, IsNumber, IsISO8601, IsBoolean, IsArray, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProjectDto {
    @ApiPropertyOptional({ example: 'Renamed Project' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ example: 'Updated description' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ example: 'https://example.com/new-logo.png' })
    @IsString()
    @IsOptional()
    logo?: string;

    @ApiPropertyOptional({ example: 40.7128 })
    @IsNumber()
    @IsOptional()
    latitude?: number;

    @ApiPropertyOptional({ example: -74.0060 })
    @IsNumber()
    @IsOptional()
    longitude?: number;

    @ApiPropertyOptional({ example: 100.5 })
    @IsNumber()
    @IsOptional()
    targetHours?: number;

    @ApiPropertyOptional({ example: '123 Main St, Anytown, USA' })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiPropertyOptional({ example: '2024-03-01T00:00:00Z' })
    @IsISO8601()
    @IsOptional()
    startDate?: string;

    @ApiPropertyOptional({ example: '2024-12-31T23:59:59Z' })
    @IsISO8601()
    @IsOptional()
    endDate?: string;

    @ApiPropertyOptional({ example: true })
    @IsBoolean()
    @IsOptional()
    active?: boolean;

    @ApiPropertyOptional({ example: false })
    @IsBoolean()
    @IsOptional()
    isLocationBound?: boolean;

    @ApiPropertyOptional({
        example: ['uuid-1', 'uuid-2'],
        description: 'Array of WorkCategory IDs',
    })
    @IsArray()
    @IsUUID('all', { each: true })
    @IsOptional()
    workCategoryIds?: string[];
}
