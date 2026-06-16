export declare class AuthorizationHelper {
    static verifyOwnership(resourceOwnerId: string, userId: string, message?: string): void;
    static verifyOwnershipMultiple(resourceOwnerIds: string[], userId: string, message?: string): void;
    static verifyMembership(memberIds: string[], userId: string, message?: string): void;
    static verifyAdmin(userRole: string, message?: string): void;
}
