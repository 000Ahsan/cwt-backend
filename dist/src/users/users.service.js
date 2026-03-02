"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const file_service_1 = require("../common/file/file.service");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    prisma;
    fileService;
    constructor(prisma, fileService) {
        this.prisma = prisma;
        this.fileService = fileService;
    }
    async findOneByEmail(email) {
        return this.prisma.user.findFirst({
            where: { email, deletedAt: null }
        });
    }
    async findOneById(id) {
        return this.prisma.user.findFirst({
            where: { id, deletedAt: null }
        });
    }
    async create(data) {
        const passwordHash = await bcrypt.hash(data.passwordHash, 10);
        let imagePath = data.image;
        if (data.image && data.image.startsWith('data:image')) {
            imagePath = await this.fileService.saveBase64Image(data.image, 'users');
        }
        return this.prisma.user.create({
            data: {
                ...data,
                passwordHash,
                image: imagePath,
            },
        });
    }
    async update(id, data) {
        const user = await this.findOneById(id);
        const updateData = { ...data };
        if (data.passwordHash && typeof data.passwordHash === 'string') {
            updateData.passwordHash = await bcrypt.hash(data.passwordHash, 10);
        }
        if (data.image && typeof data.image === 'string' && data.image.startsWith('data:image')) {
            if (user?.image) {
                await this.fileService.deleteFile(user.image);
            }
            updateData.image = await this.fileService.saveBase64Image(data.image, 'users');
        }
        return this.prisma.user.update({
            where: { id },
            data: updateData,
        });
    }
    async softDelete(id) {
        const user = await this.findOneById(id);
        if (user?.image) {
            await this.fileService.deleteFile(user.image);
        }
        return this.prisma.user.update({
            where: { id },
            data: { deletedAt: new Date(), image: null },
        });
    }
    async findWorkersByContractor(contractorId) {
        return this.prisma.user.findMany({
            where: {
                contractorId,
                role: 'WORKER',
                deletedAt: null
            },
            include: {
                assignments: {
                    include: {
                        project: true
                    }
                }
            }
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        file_service_1.FileService])
], UsersService);
//# sourceMappingURL=users.service.js.map