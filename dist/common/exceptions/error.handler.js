"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const common_1 = require("@nestjs/common");
const error_messages_constant_1 = require("../constants/error-messages.constant");
class ErrorHandler {
    static notFound(resource, identifier) {
        const friendlyMessages = {
            User: error_messages_constant_1.ERROR_MESSAGES.USER_NOT_FOUND,
            Booking: error_messages_constant_1.ERROR_MESSAGES.BOOKING_NOT_FOUND,
            Content: error_messages_constant_1.ERROR_MESSAGES.CONTENT_NOT_FOUND,
            Comment: error_messages_constant_1.ERROR_MESSAGES.COMMENT_NOT_FOUND,
            Message: error_messages_constant_1.ERROR_MESSAGES.MESSAGE_NOT_FOUND,
            Wallet: error_messages_constant_1.ERROR_MESSAGES.WALLET_NOT_FOUND,
            Conversation: error_messages_constant_1.ERROR_MESSAGES.CONVERSATION_NOT_FOUND,
            Track: error_messages_constant_1.ERROR_MESSAGES.TRACK_NOT_FOUND,
            Playlist: error_messages_constant_1.ERROR_MESSAGES.PLAYLIST_NOT_FOUND,
        };
        const message = friendlyMessages[resource] || error_messages_constant_1.ERROR_MESSAGES.NOT_FOUND;
        throw new common_1.NotFoundException(message);
    }
    static forbidden(action, resource) {
        throw new common_1.ForbiddenException(error_messages_constant_1.ERROR_MESSAGES.FORBIDDEN);
    }
    static badRequest(message) {
        throw new common_1.BadRequestException(message);
    }
    static conflict(resource, field, value) {
        const friendlyMessages = {
            email: error_messages_constant_1.ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
            username: error_messages_constant_1.ERROR_MESSAGES.USERNAME_TAKEN,
        };
        const message = friendlyMessages[field] || "This is already in use. Please try something else";
        throw new common_1.ConflictException(message);
    }
    static unauthorized(message = "Please log in to continue") {
        throw new common_1.UnauthorizedException(message);
    }
    static walletFrozen() {
        throw new common_1.BadRequestException(error_messages_constant_1.ERROR_MESSAGES.WALLET_FROZEN);
    }
    static insufficientBalance(available, required) {
        throw new common_1.BadRequestException(error_messages_constant_1.ERROR_MESSAGES.INSUFFICIENT_BALANCE);
    }
    static slotNotAvailable() {
        throw new common_1.BadRequestException(error_messages_constant_1.ERROR_MESSAGES.SLOT_NOT_AVAILABLE);
    }
    static contentAlreadyPublished() {
        throw new common_1.BadRequestException(error_messages_constant_1.ERROR_MESSAGES.CONTENT_ALREADY_PUBLISHED);
    }
    static invalidStatusTransition(currentStatus, attemptedStatus) {
        throw new common_1.BadRequestException(error_messages_constant_1.ERROR_MESSAGES.INVALID_STATUS_TRANSITION);
    }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=error.handler.js.map