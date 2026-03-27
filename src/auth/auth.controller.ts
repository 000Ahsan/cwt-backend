import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus, Patch, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login user and return JWT tokens' })
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(loginDto.identifier, loginDto.password);
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
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    async logout(@Request() req) {
        return this.authService.logout(req.user.userId);
    }

    @Patch('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Update authenticated user profile' })
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const uploadDir = './uploads/users';
                if (!require('fs').existsSync(uploadDir)) {
                    require('fs').mkdirSync(uploadDir, { recursive: true });
                }
                cb(null, uploadDir);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = uuidv4();
                cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
                return cb(new Error('Only image files (jpg/png) are allowed!'), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }))
    async updateProfile(
        @Request() req,
        @Body() updateProfileDto: UpdateProfileDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        const imagePath = file ? `/uploads/users/${file.filename}` : undefined;
        return this.authService.updateProfile(req.user.userId, updateProfileDto, imagePath);
    }
}
