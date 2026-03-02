import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'contractor@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'Password123' })
    @IsNotEmpty()
    password: string;
}
