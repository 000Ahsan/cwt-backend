import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
        };
    }>;
    refreshToken(user: any): Promise<{
        access_token: string;
    }>;
    updateProfile(userId: string, data: UpdateProfileDto, imagePath?: string): Promise<{
        id: string;
        role: import("@prisma/client").$Enums.Role;
        name: string;
        email: string;
        image: string | null;
        categories: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        contractorId: string | null;
    }>;
}
