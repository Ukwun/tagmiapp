"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThrottlerExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
let ThrottlerExceptionFilter = class ThrottlerExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const path = request.url;
        let message = "You're doing that too fast. Please wait a moment and try again.";
        if (path.includes("/auth/send-otp") || path.includes("/auth/forgot-password")) {
            message = "You can only request a code once every 2 minutes. Please wait and try again.";
        }
        else if (path.includes("/auth/verify-otp") || path.includes("/auth/reset-password")) {
            message = "Too many attempts. Please wait a minute before trying again.";
        }
        else if (path.includes("/auth/check-username")) {
            message = "Slow down! Please wait a moment before checking again.";
        }
        response.status(common_1.HttpStatus.TOO_MANY_REQUESTS).json({
            statusCode: common_1.HttpStatus.TOO_MANY_REQUESTS,
            message,
        });
    }
};
exports.ThrottlerExceptionFilter = ThrottlerExceptionFilter;
exports.ThrottlerExceptionFilter = ThrottlerExceptionFilter = __decorate([
    (0, common_1.Catch)(throttler_1.ThrottlerException)
], ThrottlerExceptionFilter);
//# sourceMappingURL=throttler-exception.filter.js.map