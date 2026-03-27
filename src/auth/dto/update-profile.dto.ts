import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
    @ApiPropertyOptional({ example: 'John Doe' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ example: 'john@example.com' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ example: '1234567890' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ example: 'NewPassword123' })
    @IsOptional()
    @MinLength(6)
    password?: string;

    @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'Profile image file' })
    @IsOptional()
    image?: any;
}
