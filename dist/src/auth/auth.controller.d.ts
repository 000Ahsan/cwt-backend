import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
        };
    } | {
        message: string;
    }>;
    refresh(req: any): Promise<{
        access_token: string;
    }>;
    logout(): Promise<{
        message: string;
    }>;
    updateProfile(req: any, updateProfileDto: UpdateProfileDto, file?: Express.Multer.File): Promise<{
        name: string;
        id: string;
        role: import("@prisma/client").$Enums.Role;
        email: string;
        image: string | null;
        categories: string | null;
        contractorId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
}
