import { IsEmail, IsNotEmpty, IsOptional, MinLength, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkerDto {
    @ApiProperty({ example: 'worker@example.com' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ example: '1234567890' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ example: 'John Doe' })
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Password123' })
    @IsNotEmpty()
    @MinLength(6)
    password: string;

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
