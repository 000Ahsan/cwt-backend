import { IsNotEmpty, IsUUID, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignWorkerDto {
    @ApiProperty({ example: 'worker-uuid-here' })
    @IsUUID()
    @IsNotEmpty()
    workerId: string;

    @ApiProperty({ example: 'category-uuid-here' })
    @IsUUID()
    @IsNotEmpty()
    workCategoryId: string;

    @ApiProperty({ example: 25.0 })
    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    hourlyRate: number;
}

