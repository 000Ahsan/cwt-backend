import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateWorkLogTimeDto {
    @ApiProperty({ example: '2026-04-16T08:00:00.000Z' })
    @IsNotEmpty()
    @IsDateString()
    startTime: string;

    @ApiProperty({ example: '2026-04-16T12:00:00.000Z' })
    @IsNotEmpty()
    @IsDateString()
    endTime: string;

    @ApiProperty({ example: '2026-04-16', description: 'The date for the work session' })
    @IsOptional()
    @IsDateString()
    date?: string;
}
