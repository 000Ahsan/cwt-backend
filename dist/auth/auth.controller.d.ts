import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
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
}
