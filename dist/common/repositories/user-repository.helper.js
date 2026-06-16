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
exports.UserRepositoryHelper = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
let UserRepositoryHelper = class UserRepositoryHelper {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async findByIdOrFail(id, relations = []) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations,
        });
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        return user;
    }
    async findById(id, relations = []) {
        return this.userRepository.findOne({
            where: { id },
            relations,
        });
    }
    async findByUsername(username) {
        return this.userRepository.findOne({
            where: { username },
        });
    }
    async findByEmail(email) {
        return this.userRepository.findOne({
            where: { email },
        });
    }
    async findByIds(ids, relations = []) {
        if (ids.length === 0)
            return [];
        return this.userRepository.find({
            where: { id: (0, typeorm_2.In)(ids) },
            relations,
        });
    }
    async exists(id) {
        const count = await this.userRepository.count({ where: { id } });
        return count > 0;
    }
};
exports.UserRepositoryHelper = UserRepositoryHelper;
exports.UserRepositoryHelper = UserRepositoryHelper = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserRepositoryHelper);
//# sourceMappingURL=user-repository.helper.js.map