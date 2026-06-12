import { DataSource } from "typeorm";
import { User } from "../../users/entities/user.entity";
export interface SeededUser {
    email: string;
    password: string;
    username: string;
    displayName: string;
    role: "talent" | "client";
}
export declare const SEEDED_USERS: SeededUser[];
export declare function seedUsers(dataSource: DataSource): Promise<Map<string, User>>;
