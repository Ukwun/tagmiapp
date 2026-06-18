import { Repository, FindManyOptions, FindOptionsWhere, SelectQueryBuilder } from "typeorm";
import { Report } from "../entities/report.entity";
export declare class ReportRepository {
    private readonly repository;
    constructor(repository: Repository<Report>);
    findAndCount(options: FindManyOptions<Report>): Promise<[Report[], number]>;
    create(data: Partial<Report>): Report;
    save(report: Report): Promise<Report>;
    findOne(options: {
        where: FindOptionsWhere<Report>;
        relations?: string[];
    }): Promise<Report | null>;
    count(options?: FindManyOptions<Report>): Promise<number>;
    remove(report: Report): Promise<Report>;
    createQueryBuilder(alias: string): SelectQueryBuilder<Report>;
}
