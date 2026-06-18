"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedInteractions = seedInteractions;
const content_entity_1 = require("../../content/entities/content.entity");
const content_interaction_entity_1 = require("../../content/entities/content-interaction.entity");
const comment_entity_1 = require("../../content/entities/comment.entity");
const comment_like_entity_1 = require("../../content/entities/comment-like.entity");
const COMMENT_TEXTS = [
    "This is amazing! 🔥",
    "Love your work! Keep it up 💪",
    "So inspiring! ✨",
    "This is pure talent 👏",
    "Absolutely incredible!",
    "You never disappoint! 🙌",
    "This deserves more recognition!",
    "Stunning work as always 😍",
    "Can't wait to see more!",
    "You're so talented! 💯",
    "This is exactly what I needed to see today!",
    "Your creativity knows no bounds 🎨",
    "How do you do it? Share your secrets! 🤔",
    "This is next level! 🚀",
    "Beautiful work! 💙",
    "You inspire me every day!",
    "This is goals! 🎯",
    "Perfection! 👌",
    "Your best work yet!",
    "Speechless! 😱",
];
const COMMENT_REPLIES = [
    "Thank you so much! 🙏",
    "I really appreciate it! ❤️",
    "Thanks for the support! 💪",
    "Glad you liked it! 😊",
    "More coming soon! 🔜",
    "You're too kind! 🥰",
    "Thank you! That means a lot 💙",
    "Appreciate you! 🙌",
    "Thanks for always supporting! ✨",
    "Your words mean everything! 💫",
];
async function seedInteractions(dataSource, users, allContent) {
    const interactionRepository = dataSource.getRepository(content_interaction_entity_1.ContentInteraction);
    const commentRepository = dataSource.getRepository(comment_entity_1.Comment);
    const commentLikeRepository = dataSource.getRepository(comment_like_entity_1.CommentLike);
    const contentRepository = dataSource.getRepository(content_entity_1.Content);
    console.log("\n🔄 Seeding interactions...");
    for (const content of allContent) {
        const otherUsers = users.filter((u) => u.id !== content.userId);
        const numLikes = Math.floor(Math.random() * (otherUsers.length * 0.4)) + Math.floor(otherUsers.length * 0.3);
        const likingUsers = shuffleArray(otherUsers).slice(0, numLikes);
        for (const user of likingUsers) {
            const existing = await interactionRepository.findOne({
                where: { contentId: content.id, userId: user.id, type: "like" },
            });
            if (!existing) {
                const interaction = interactionRepository.create({
                    contentId: content.id,
                    userId: user.id,
                    type: "like",
                });
                await interactionRepository.save(interaction);
            }
        }
        const numBookmarks = Math.floor(numLikes * 0.15);
        const bookmarkingUsers = shuffleArray(likingUsers).slice(0, numBookmarks);
        for (const user of bookmarkingUsers) {
            const existing = await interactionRepository.findOne({
                where: { contentId: content.id, userId: user.id, type: "bookmark" },
            });
            if (!existing) {
                const interaction = interactionRepository.create({
                    contentId: content.id,
                    userId: user.id,
                    type: "bookmark",
                });
                await interactionRepository.save(interaction);
            }
        }
        const numShares = Math.floor(numLikes * 0.08);
        const sharingUsers = shuffleArray(likingUsers).slice(0, numShares);
        for (const user of sharingUsers) {
            const existing = await interactionRepository.findOne({
                where: { contentId: content.id, userId: user.id, type: "share" },
            });
            if (!existing) {
                const interaction = interactionRepository.create({
                    contentId: content.id,
                    userId: user.id,
                    type: "share",
                });
                await interactionRepository.save(interaction);
            }
        }
        const actualLikes = await interactionRepository.count({
            where: { contentId: content.id, type: "like" },
        });
        const actualShares = await interactionRepository.count({
            where: { contentId: content.id, type: "share" },
        });
        content.likeCount = actualLikes;
        content.shareCount = actualShares;
        const numComments = Math.floor(Math.random() * (numLikes * 0.2)) + Math.floor(numLikes * 0.1);
        const commentingUsers = shuffleArray(likingUsers).slice(0, numComments);
        for (const user of commentingUsers) {
            const commentText = COMMENT_TEXTS[Math.floor(Math.random() * COMMENT_TEXTS.length)];
            const comment = commentRepository.create({
                contentId: content.id,
                userId: user.id,
                text: commentText,
                likes: 0,
            });
            const savedComment = await commentRepository.save(comment);
            if (Math.random() < 0.3) {
                const replyText = COMMENT_REPLIES[Math.floor(Math.random() * COMMENT_REPLIES.length)];
                const reply = commentRepository.create({
                    contentId: content.id,
                    userId: content.userId,
                    text: replyText,
                    parentId: savedComment.id,
                    likes: 0,
                });
                await commentRepository.save(reply);
            }
            const numCommentLikes = Math.floor(Math.random() * (otherUsers.length * 0.3)) + Math.floor(otherUsers.length * 0.2);
            const commentLikingUsers = shuffleArray(otherUsers).slice(0, numCommentLikes);
            for (const likeUser of commentLikingUsers) {
                const existing = await commentLikeRepository.findOne({
                    where: { commentId: savedComment.id, userId: likeUser.id },
                });
                if (!existing) {
                    const commentLike = commentLikeRepository.create({
                        commentId: savedComment.id,
                        userId: likeUser.id,
                    });
                    await commentLikeRepository.save(commentLike);
                    savedComment.likes += 1;
                    await commentRepository.save(savedComment);
                }
            }
        }
        const actualComments = await commentRepository.count({
            where: { contentId: content.id, parentId: null },
        });
        content.commentCount = actualComments;
        await contentRepository.save(content);
    }
    console.log("✅ Interactions seeded successfully!");
}
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}
//# sourceMappingURL=interactions.seeder.js.map