import { IsEmail, IsNotEmpty, IsOptional, MinLength, IsString, IsArray, IsUUID } from 'class-validator';
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
        example: ['uuid-1', 'uuid-2'],
        description: 'Array of WorkCategory IDs',
    })
    @IsOptional()
    @IsArray()
    @IsUUID('all', { each: true })
    workCategoryIds?: string[];

    @ApiPropertyOptional({ example: 25.5 })
    @IsOptional()
    defaultHourlyRate?: number;
}
