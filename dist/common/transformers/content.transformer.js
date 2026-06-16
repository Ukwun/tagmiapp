"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentTransformer = void 0;
class ContentTransformer {
    static async enrichWithInteractions(content, userId, likeRepository, bookmarkRepository) {
        const enriched = { ...content };
        if (userId) {
            const [liked, bookmarked] = await Promise.all([
                likeRepository.count({
                    where: { contentId: content.id, userId },
                }),
                bookmarkRepository.count({
                    where: { contentId: content.id, userId },
                }),
            ]);
            enriched.isLiked = liked > 0;
            enriched.isBookmarked = bookmarked > 0;
        }
        return enriched;
    }
    static async enrichManyWithInteractions(contents, userId, likeRepository, bookmarkRepository) {
        return Promise.all(contents.map((content) => this.enrichWithInteractions(content, userId, likeRepository, bookmarkRepository)));
    }
}
exports.ContentTransformer = ContentTransformer;
//# sourceMappingURL=content.transformer.js.map