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
            refresh_token: await this.jwtService.signAsync(payload, { expiresIn: '7d' }),
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                name: user.name,
                role: user.role,
            },
        };
    }

    async logout(userId: string) {
        await this.attendanceService.logLogout(userId);
        return { message: 'Logged out successfully' };
    }

    async refreshToken(user: any) {
        const payload = { sub: user.sub, email: user.email, role: user.role };
        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }

    async updateProfile(userId: string, data: UpdateProfileDto, imagePath?: string) {
        const updateData: any = {
            name: data.name,
            email: data.email,
            phone: data.phone,
        };

        if (data.password) {
            updateData.passwordHash = data.password;
        }

        if (imagePath) {
            updateData.image = imagePath;
        }

        const user = await this.usersService.update(userId, updateData);
        return this.usersService.removePassword(user);
    }
}
