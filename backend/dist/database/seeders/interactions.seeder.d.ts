import { DataSource } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Content } from "../../content/entities/content.entity";
export declare function seedInteractions(dataSource: DataSource, users: User[], allContent: Content[]): Promise<void>;
