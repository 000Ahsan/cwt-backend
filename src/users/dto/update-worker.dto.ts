import { IsEmail, IsOptional, IsNotEmpty, MinLength, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWorkerDto {
    @ApiPropertyOptional({ example: 'worker@example.com' })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({ example: 'John Doe' })
    @IsNotEmpty()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ example: 'NewPassword123' })
    @IsOptional()
    @MinLength(6)
    password?: string;

    @ApiPropertyOptional({ example: 'data:image/png;base64,...' })
    @IsOptional()
    @IsString()
    image?: string;

    @ApiPropertyOptional({
        example: 'CONSTRUCTION,CLEANING',
        description: 'Comma-separated list of categories e.g. CONSTRUCTION, CLEANING, ROOFING',
    })
    @IsOptional()
    @IsString()
    categories?: string;
}
