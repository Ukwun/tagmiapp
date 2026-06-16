"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationHelper = void 0;
const common_1 = require("@nestjs/common");
class AuthorizationHelper {
    static verifyOwnership(resourceOwnerId, userId, message = "You don't have permission to do that") {
        if (resourceOwnerId !== userId) {
            throw new common_1.ForbiddenException(message);
        }
    }
    static verifyOwnershipMultiple(resourceOwnerIds, userId, message = "You don't have permission to do that") {
        if (!resourceOwnerIds.includes(userId)) {
            throw new common_1.ForbiddenException(message);
        }
    }
    static verifyMembership(memberIds, userId, message = "You need to join this group first") {
        if (!memberIds.includes(userId)) {
            throw new common_1.ForbiddenException(message);
        }
    }
    static verifyAdmin(userRole, message = "You don't have permission to do that") {
        if (userRole !== "admin") {
            throw new common_1.ForbiddenException(message);
        }
    }
}
exports.AuthorizationHelper = AuthorizationHelper;
//# sourceMappingURL=authorization.helper.js.map