import { IsEmail, IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Currency } from '@prisma/client';

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

    @ApiPropertyOptional({ enum: Currency, example: 'USD', description: 'Preferred currency (CONTRACTOR only)' })
    @IsOptional()
    @IsEnum(Currency)
    currency?: Currency;

    @ApiPropertyOptional({ example: 'Acme Construction Ltd.' })
    @IsOptional()
    @IsString()
    companyName?: string;

    @ApiPropertyOptional({ example: '123 Main St, City, Country' })
    @IsOptional()
    @IsString()
    companyAddress?: string;

    @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'Company logo image file' })
    @IsOptional()
    companyLogo?: any;
}
