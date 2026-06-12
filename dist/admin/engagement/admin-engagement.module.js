"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminEngagementModule = void 0;
const common_1 = require("@nestjs/common");
const admin_engagement_service_1 = require("./admin-engagement.service");
const admin_engagement_controller_1 = require("./admin-engagement.controller");
const content_module_1 = require("../../content/content.module");
const trending_module_1 = require("../../ai/trending/trending.module");
let AdminEngagementModule = class AdminEngagementModule {
};
exports.AdminEngagementModule = AdminEngagementModule;
exports.AdminEngagementModule = AdminEngagementModule = __decorate([
    (0, common_1.Module)({
        imports: [content_module_1.ContentModule, trending_module_1.TrendingModule],
        controllers: [admin_engagement_controller_1.AdminEngagementController],
        providers: [admin_engagement_service_1.AdminEngagementService],
    })
], AdminEngagementModule);
//# sourceMappingURL=admin-engagement.module.js.map