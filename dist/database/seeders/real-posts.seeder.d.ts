import { DataSource } from "typeorm";
import { User } from "../../users/entities/user.entity";
export declare function seedRealMultiSlidePosts(dataSource: DataSource, users: User[]): Promise<void>;
