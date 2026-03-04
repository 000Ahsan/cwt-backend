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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkLogsController = void 0;
const common_1 = require("@nestjs/common");
require("multer");
const work_logs_service_1 = require("./work-logs.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const uuid_1 = require("uuid");
const path = __importStar(require("path"));
const swagger_1 = require("@nestjs/swagger");
const create_work_log_dto_1 = require("./dto/create-work-log.dto");
let WorkLogsController = class WorkLogsController {
    workLogsService;
    constructor(workLogsService) {
        this.workLogsService = workLogsService;
    }
    async create(req, body, files) {
        return this.workLogsService.createLog(req.user.userId, {
            sessionId: body.sessionId,
            description: body.description,
            photos: files,
        });
    }
    async getWorkerLogs(req) {
        return this.workLogsService.getWorkerLogs(req.user.userId);
    }
};
exports.WorkLogsController = WorkLogsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.WORKER),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit a work log with photos' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('photos', 10, {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const date = new Date();
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const uploadDir = `./uploads/work-photos/${year}/${month}`;
                if (!require('fs').existsSync(uploadDir)) {
                    require('fs').mkdirSync(uploadDir, { recursive: true });
                }
                cb(null, uploadDir);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = (0, uuid_1.v4)();
                cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
                return cb(new Error('Only image files (jpg/png) are allowed!'), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_work_log_dto_1.CreateWorkLogDto, Array]),
    __metadata("design:returntype", Promise)
], WorkLogsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('worker'),
    (0, roles_decorator_1.Roles)(client_1.Role.WORKER),
    (0, swagger_1.ApiOperation)({ summary: 'Get work logs for the current worker' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkLogsController.prototype, "getWorkerLogs", null);
exports.WorkLogsController = WorkLogsController = __decorate([
    (0, swagger_1.ApiTags)('Work Logs'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('work-logs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [work_logs_service_1.WorkLogsService])
], WorkLogsController);
//# sourceMappingURL=work-logs.controller.js.map