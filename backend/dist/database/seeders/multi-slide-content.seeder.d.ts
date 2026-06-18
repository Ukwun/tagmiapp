import { DataSource } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Content } from "../../content/entities/content.entity";
export declare function seedMultiSlideContent(dataSource: DataSource, users: User[]): Promise<Content[]>;
