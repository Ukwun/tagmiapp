"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationHelper = void 0;
class PaginationHelper {
    static normalizeParams(params) {
        const page = Math.max(Number(params.page) || 1, 1);
        const limit = Math.min(Math.max(Number(params.limit) || 20, 1), 100);
        return { page, limit };
    }
    static buildResponse(data, total, page, limit) {
        return {
            data,
            total,
            page,
            limit,
            hasNext: page * limit < total,
            hasPrev: page > 1,
        };
    }
    static applyToQueryBuilder(queryBuilder, page, limit) {
        return queryBuilder.skip((page - 1) * limit).take(limit);
    }
    static async paginate(repository, findOptions, params) {
        const { page, limit } = this.normalizeParams(params);
        const [data, total] = await repository.findAndCount({
            ...findOptions,
            skip: (page - 1) * limit,
            take: limit,
        });
        return this.buildResponse(data, total, page, limit);
    }
}
exports.PaginationHelper = PaginationHelper;
//# sourceMappingURL=pagination.util.js.map