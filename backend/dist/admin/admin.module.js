"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const admin_dashboard_module_1 = require("./dashboard/admin-dashboard.module");
const admin_users_module_1 = require("./users/admin-users.module");
const admin_content_module_1 = require("./content/admin-content.module");
const admin_engagement_module_1 = require("./engagement/admin-engagement.module");
const admin_reports_module_1 = require("./reports/admin-reports.module");
const admin_wallets_module_1 = require("./wallets/admin-wallets.module");
const admin_referrals_module_1 = require("./referrals/admin-referrals.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            admin_dashboard_module_1.AdminDashboardModule,
            admin_users_module_1.AdminUsersModule,
            admin_content_module_1.AdminContentModule,
            admin_engagement_module_1.AdminEngagementModule,
            admin_reports_module_1.AdminReportsModule,
            admin_wallets_module_1.AdminWalletsModule,
            admin_referrals_module_1.AdminReferralsModule,
        ],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map