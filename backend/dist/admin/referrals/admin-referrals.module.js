"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminReferralsModule = void 0;
const common_1 = require("@nestjs/common");
const referrals_module_1 = require("../../referrals/referrals.module");
const admin_referrals_controller_1 = require("./admin-referrals.controller");
let AdminReferralsModule = class AdminReferralsModule {
};
exports.AdminReferralsModule = AdminReferralsModule;
exports.AdminReferralsModule = AdminReferralsModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => referrals_module_1.ReferralsModule)],
        controllers: [admin_referrals_controller_1.AdminReferralsController],
    })
], AdminReferralsModule);
//# sourceMappingURL=admin-referrals.module.js.map