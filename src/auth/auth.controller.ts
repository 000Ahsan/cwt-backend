import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus, Patch, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';

const imageFileFilter = (req: any, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
        return cb(new Error(`Only image files are allowed! Mimetype was: ${file.mimetype}`), false);
    }
    cb(null, true);
};

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
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'image', maxCount: 1 },
        { name: 'companyLogo', maxCount: 1 },
    ], {
        storage: memoryStorage(),
        fileFilter: imageFileFilter,
        limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }))
    async updateProfile(
        @Request() req,
        @Body() updateProfileDto: UpdateProfileDto,
        @UploadedFiles() files?: { image?: Express.Multer.File[]; companyLogo?: Express.Multer.File[] },
    ) {
        let imageUrl: string | undefined;
        let companyLogoUrl: string | undefined;

        if (files?.image?.[0]) {
            const result = await this.cloudinaryService.uploadFile(files.image[0]);
            imageUrl = result.secure_url;
        }
        if (files?.companyLogo?.[0]) {
            const result = await this.cloudinaryService.uploadFile(files.companyLogo[0]);
            companyLogoUrl = result.secure_url;
        }

        return this.authService.updateProfile(req.user.userId, updateProfileDto, imageUrl, companyLogoUrl);
    }
}
