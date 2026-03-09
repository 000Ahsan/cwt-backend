import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkLogStatus } from '@prisma/client';

export class SignOffWorkLogDto {
    @ApiProperty({ enum: WorkLogStatus, example: WorkLogStatus.APPROVED })
    @IsEnum(WorkLogStatus)
    status: WorkLogStatus;

    @ApiPropertyOptional({ example: 'Good job, everything looks correct.' })
    @IsString()
    @IsOptional()
    comment?: string;
}
