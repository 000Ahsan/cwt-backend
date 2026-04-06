import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus, Patch, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private cloudinaryService: CloudinaryService
    ) { }

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
    @ApiOperation({ summary: 'Refresh access token using refresh token' })
    async refresh(@Body('refresh_token') refreshToken: string) {
        return this.authService.refreshToken(refreshToken);
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
        storage: memoryStorage(),
        fileFilter: (req, file, cb) => {
            console.log('--- Incoming File Info (Auth) ---');
            console.log('MimeType:', file.mimetype);
            console.log('FileName:', file.originalname);
            console.log('---');
            
            if (!file.mimetype || !file.mimetype.startsWith('image/')) {
                return cb(new Error(`Only image files are allowed! Mimetype was: ${file.mimetype}`), false);
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
        let imageUrl = undefined;
        if (file) {
            const result = await this.cloudinaryService.uploadFile(file);
            imageUrl = result.secure_url;
        }
        return this.authService.updateProfile(req.user.userId, updateProfileDto, imageUrl);
    }
}
