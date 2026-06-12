import { DataSource } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Content } from "../../content/entities/content.entity";
export declare function seedContent(dataSource: DataSource, userMap: Map<string, User>): Promise<Content[]>;
