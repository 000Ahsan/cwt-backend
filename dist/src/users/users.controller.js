"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
const create_worker_dto_1 = require("./dto/create-worker.dto");
const update_worker_dto_1 = require("./dto/update-worker.dto");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async findAllWorkers(req) {
        return this.usersService.findWorkersByContractor(req.user.userId);
    }
    async createWorker(req, body) {
        const { password, ...userData } = body;
        return this.usersService.create({
            ...userData,
            passwordHash: password,
            role: client_1.Role.WORKER,
            contractor: { connect: { id: req.user.userId } }
        });
    }
    async updateWorker(id, body, req) {
        const { password, ...userData } = body;
        const worker = await this.usersService.findOneById(id);
        if (!worker) {
            throw new common_1.NotFoundException('Worker not found');
        }
        if (worker.contractorId !== req.user.userId) {
            throw new common_1.ForbiddenException('You can only edit your own workers');
        }
        const updateData = { ...userData };
        if (password) {
            updateData.passwordHash = password;
        }
        return this.usersService.update(id, updateData);
    }
    async removeWorker(id, req) {
        const worker = await this.usersService.findOneById(id);
        if (!worker)
            throw new common_1.NotFoundException('Worker not found');
        if (worker.contractorId !== req.user.userId) {
            throw new common_1.ForbiddenException('You can only delete your own workers');
        }
        return this.usersService.softDelete(id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('workers'),
    (0, roles_decorator_1.Roles)(client_1.Role.CONTRACTOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get all workers belonging to the contractor' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAllWorkers", null);
__decorate([
    (0, common_1.Post)('workers'),
    (0, roles_decorator_1.Roles)(client_1.Role.CONTRACTOR),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new worker under the contractor' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_worker_dto_1.CreateWorkerDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createWorker", null);
__decorate([
    (0, common_1.Put)('workers/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.CONTRACTOR),
    (0, swagger_1.ApiOperation)({ summary: 'Update a worker details by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_worker_dto_1.UpdateWorkerDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateWorker", null);
__decorate([
    (0, common_1.Delete)('workers/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.CONTRACTOR),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete a worker' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "removeWorker", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map