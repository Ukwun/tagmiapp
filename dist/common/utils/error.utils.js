"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorMessage = getErrorMessage;
exports.getErrorStack = getErrorStack;
function getErrorMessage(error) {
    if (error instanceof Error)
        return error.message;
    return String(error);
}
function getErrorStack(error) {
    return error instanceof Error ? error.stack : undefined;
}
//# sourceMappingURL=error.utils.js.map