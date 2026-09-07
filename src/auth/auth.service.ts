import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AttendanceService } from '../attendance/attendance.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private attendanceService: AttendanceService,
    ) { }

    async validateUser(identifier: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmailOrPhone(identifier);
        if (user && (await bcrypt.compare(pass, user.passwordHash))) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        await this.attendanceService.logLogin(user.id);
        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            access_token: await this.jwtService.signAsync(payload),
            refresh_token: await this.jwtService.signAsync(payload, { 
                expiresIn: '7d',
                secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret' 
            }),
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                name: user.name,
                role: user.role,
                image: user.image,
                currency: user.currency,
                companyName: user.companyName,
                companyLogo: user.companyLogo,
                companyAddress: user.companyAddress,
            },
        };
    }

    async logout(userId: string) {
        await this.attendanceService.logLogout(userId);
        return { message: 'Logged out successfully' };
    }

    async refreshToken(token: string) {
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
            });
            const newPayload = { sub: payload.sub, email: payload.email, role: payload.role };
            return {
                access_token: await this.jwtService.signAsync(newPayload),
            };
        } catch (e) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async updateProfile(
        userId: string,
        data: UpdateProfileDto,
        imagePath?: string,
        companyLogoPath?: string,
    ) {
        const updateData: any = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            companyName: data.companyName,
            companyAddress: data.companyAddress,
            ...(data.currency && { currency: data.currency }),
        };

        if (data.password) {
            updateData.passwordHash = data.password;
        }

        if (imagePath) {
            updateData.image = imagePath;
        }

        if (companyLogoPath) {
            updateData.companyLogo = companyLogoPath;
        }

        const user = await this.usersService.update(userId, updateData);
        return this.usersService.removePassword(user);
    }
}
