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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateWorkLogDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateWorkLogDto {
    sessionId;
    description;
    photos;
}
exports.CreateWorkLogDto = CreateWorkLogDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'session-uuid-here' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateWorkLogDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Finished the bricklaying for the north wall.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateWorkLogDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'array', items: { type: 'string', format: 'binary' }, description: 'Upload up to 10 work photos' }),
    __metadata("design:type", Array)
], CreateWorkLogDto.prototype, "photos", void 0);
//# sourceMappingURL=create-work-log.dto.js.map