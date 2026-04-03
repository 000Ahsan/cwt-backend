import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkCategoryDto {
    @ApiProperty({ example: 'Drywall' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 25.0 })
    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    hourlyRate: number;
}
