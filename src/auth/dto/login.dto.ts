import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'contractor@example.com or 1234567890' })
    @IsNotEmpty()
    identifier: string;

    @ApiProperty({ example: 'Password123' })
    @IsNotEmpty()
    password: string;
}
