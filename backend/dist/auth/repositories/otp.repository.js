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
exports.OtpRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const email_otp_entity_1 = require("../entities/email-otp.entity");
let OtpRepository = class OtpRepository {
    constructor(repository) {
        this.repository = repository;
    }
    async findRecentOtp(email, minutesAgo) {
        return this.repository.findOne({
            where: {
                email,
                createdAt: (0, typeorm_2.MoreThan)(new Date(Date.now() - minutesAgo * 60_000)),
            },
            order: { createdAt: "DESC" },
        });
    }
    async findValidOtp(email, code) {
        return this.repository.findOne({
            where: {
                email,
                code,
                verified: false,
                expiresAt: (0, typeorm_2.MoreThan)(new Date()),
            },
            order: { createdAt: "DESC" },
        });
    }
    async findVerifiedOtp(email) {
        return this.repository.findOne({
            where: {
                email,
                verified: true,
            },
            order: { createdAt: "DESC" },
        });
    }
    async create(email, code, expiresAt) {
        const otp = this.repository.create({ email, code, expiresAt });
        return this.repository.save(otp);
    }
    async save(otp) {
        return this.repository.save(otp);
    }
    async findOne(options) {
        return this.repository.findOne(options);
    }
};
exports.OtpRepository = OtpRepository;
exports.OtpRepository = OtpRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(email_otp_entity_1.EmailOtp)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], OtpRepository);
//# sourceMappingURL=otp.repository.js.map