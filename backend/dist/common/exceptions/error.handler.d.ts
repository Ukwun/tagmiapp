export declare class ErrorHandler {
    static notFound(resource: string, identifier?: string): never;
    static forbidden(action: string, resource?: string): never;
    static badRequest(message: string): never;
    static conflict(resource: string, field: string, value: string): never;
    static unauthorized(message?: string): never;
    static walletFrozen(): never;
    static insufficientBalance(available: number, required: number): never;
    static slotNotAvailable(): never;
    static contentAlreadyPublished(): never;
    static invalidStatusTransition(currentStatus: string, attemptedStatus: string): never;
}
