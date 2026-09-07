import { IsEmail, IsOptional, IsNotEmpty, MinLength, IsString, IsArray, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWorkerDto {
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({ example: '1234567890' })
    @IsOptional()
    @IsString()
    phone?: string;

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
