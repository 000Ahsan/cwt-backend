import { IsNotEmpty, IsOptional, IsString, IsNumber, IsISO8601, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
    @ApiProperty({ example: 'Main Construction Site' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ example: 'The primary project for testing' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
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

    @ApiPropertyOptional({ example: false })
    @IsBoolean()
    @IsOptional()
    isLocationBound?: boolean;

    @ApiPropertyOptional({
        example: 'CONSTRUCTION,ROOFING',
        description: 'Comma-separated list of categories e.g. CONSTRUCTION, CLEANING, ROOFING',
    })
    @IsString()
    @IsOptional()
    categories?: string;
}
