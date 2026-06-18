import { OnModuleInit } from "@nestjs/common";
import { Repository } from "typeorm";
import { ContentEmbedding } from "./content-embedding.entity";
import { UserEmbedding } from "./user-embedding.entity";
import { Content } from "../../content/entities/content.entity";
import { User } from "../../users/entities/user.entity";
export declare class EmbeddingsService implements OnModuleInit {
    private readonly contentEmbeddingRepository;
    private readonly userEmbeddingRepository;
    private readonly contentRepository;
    private readonly userRepository;
    private readonly logger;
    private pipeline;
    private isModelLoading;
    constructor(contentEmbeddingRepository: Repository<ContentEmbedding>, userEmbeddingRepository: Repository<UserEmbedding>, contentRepository: Repository<Content>, userRepository: Repository<User>);
    onModuleInit(): Promise<void>;
    private loadModel;
    generateEmbedding(text: string): Promise<number[] | null>;
    cosineSimilarity(a: number[], b: number[]): number;
    embedContent(contentId: string): Promise<void>;
    embedUser(userId: string): Promise<void>;
    getContentEmbedding(contentId: string): Promise<number[] | null>;
    getUserEmbedding(userId: string): Promise<number[] | null>;
    backfillContentEmbeddings(): Promise<void>;
    backfillUserEmbeddings(): Promise<void>;
    private buildContentText;
    private buildUserText;
    findSimilarContent(contentId: string, limit?: number): Promise<{
        contentId: string;
        similarity: number;
    }[]>;
    findSimilarUsers(userId: string, limit?: number): Promise<{
        userId: string;
        similarity: number;
    }[]>;
    semanticSearch(query: string, limit?: number): Promise<{
        contentId: string;
        similarity: number;
    }[]>;
    semanticUserSearch(query: string, limit?: number): Promise<{
        userId: string;
        similarity: number;
    }[]>;
    isModelReady(): boolean;
}
