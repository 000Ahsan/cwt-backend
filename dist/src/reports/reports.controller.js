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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
let ReportsController = class ReportsController {
    reportsService;
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async getDaily(req, dateStr) {
        const date = dateStr ? new Date(dateStr) : new Date();
        return this.reportsService.getDailyReport(req.user.userId, date);
    }
    async getWeekly(req, dateStr) {
        const date = dateStr ? new Date(dateStr) : new Date();
        return this.reportsService.getWeeklyReport(req.user.userId, date);
    }
    async getDashboardStats(req) {
        return this.reportsService.getDashboardStats(req.user.userId);
    }
    async getProjectsChart(req, startDate, endDate) {
        return this.reportsService.getProjectsChartData(req.user.userId, startDate, endDate);
    }
    async getWorkersChart(req, startDate, endDate) {
        return this.reportsService.getWorkersChartData(req.user.userId, startDate, endDate);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('daily'),
    (0, swagger_1.ApiOperation)({ summary: 'Get daily report for the contractor' }),
    (0, swagger_1.ApiQuery)({ name: 'date', required: false, type: String, example: '2024-03-20' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getDaily", null);
__decorate([
    (0, common_1.Get)('weekly'),
    (0, swagger_1.ApiOperation)({ summary: 'Get weekly report for the contractor' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: String, example: '2024-03-18' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getWeekly", null);
__decorate([
    (0, common_1.Get)('dashboard-stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dashboard statistics for the contractor' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('chart/projects'),
    (0, swagger_1.ApiOperation)({ summary: 'Daily minutes logged per project (line chart data)' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: true, type: String, example: '2026-03-01', description: 'Start of date range (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: true, type: String, example: '2026-03-31', description: 'End of date range (YYYY-MM-DD)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getProjectsChart", null);
__decorate([
    (0, common_1.Get)('chart/workers'),
    (0, swagger_1.ApiOperation)({ summary: 'Daily minutes logged per worker (line chart data)' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: true, type: String, example: '2026-03-01', description: 'Start of date range (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: true, type: String, example: '2026-03-31', description: 'End of date range (YYYY-MM-DD)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getWorkersChart", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('Reports'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.CONTRACTOR),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map