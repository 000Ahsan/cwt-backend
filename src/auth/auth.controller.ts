import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            return { message: 'Invalid credentials' };
        }
        return this.authService.login(user);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Request() req) {
        // Basic implementation for now, in production should validate refresh token from body or cookie
        return this.authService.refreshToken(req.user);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout() {
        return { message: 'Logged out successfully' };
    }
}
