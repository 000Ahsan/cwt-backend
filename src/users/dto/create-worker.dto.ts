import { IsEmail, IsNotEmpty, IsOptional, MinLength, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkerDto {
    @ApiProperty({ example: 'worker@example.com' })
    @IsEmail()
    email: string;

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
}
