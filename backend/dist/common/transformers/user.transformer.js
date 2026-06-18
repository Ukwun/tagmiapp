"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTransformer = void 0;
class UserTransformer {
    static sanitize(user) {
        if (!user)
            return null;
        const { passwordHash, ...safe } = user;
        return safe;
    }
    static sanitizeMany(users) {
        return users.map((user) => this.sanitize(user)).filter(Boolean);
    }
    static toPublicProfile(user) {
        return {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
        };
    }
}
exports.UserTransformer = UserTransformer;
//# sourceMappingURL=user.transformer.js.map