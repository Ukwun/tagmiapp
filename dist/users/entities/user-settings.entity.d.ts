import { User } from "./user.entity";
export declare class UserSettings {
    id: string;
    userId: string;
    emailMessages: boolean;
    pushMessages: boolean;
    marketingEmails: boolean;
    profileVisible: boolean;
    showLocation: boolean;
    showRates: boolean;
    autoAcceptBookings: boolean;
    requireDeposit: boolean;
    advanceNotice: number;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
