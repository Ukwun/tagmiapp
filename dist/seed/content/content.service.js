"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentService = void 0;
var common_1 = require("@nestjs/common");
var ContentService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ContentService = _classThis = /** @class */ (function () {
        function ContentService_1(contentRepository, interactionRepository, commentRepository, userRepository, cloudinaryService) {
            this.contentRepository = contentRepository;
            this.interactionRepository = interactionRepository;
            this.commentRepository = commentRepository;
            this.userRepository = userRepository;
            this.cloudinaryService = cloudinaryService;
        }
        ContentService_1.prototype.create = function (userId, createContentDto, file) {
            return __awaiter(this, void 0, void 0, function () {
                var user, type, uploadResult, _a, content;
                var _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0: return [4 /*yield*/, this.userRepository.findOne({ where: { id: userId } })];
                        case 1:
                            user = _d.sent();
                            if (!user) {
                                throw new common_1.NotFoundException("User not found");
                            }
                            if (file.mimetype.startsWith("image/")) {
                                type = "image";
                            }
                            else if (file.mimetype.startsWith("video/")) {
                                type = "video";
                            }
                            else if (file.mimetype.startsWith("audio/")) {
                                type = "audio";
                            }
                            else {
                                throw new Error("Unsupported file type");
                            }
                            if (!(type === "video")) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.cloudinaryService.uploadVideo(file)];
                        case 2:
                            _a = _d.sent();
                            return [3 /*break*/, 5];
                        case 3: return [4 /*yield*/, this.cloudinaryService.uploadFile(file)];
                        case 4:
                            _a = _d.sent();
                            _d.label = 5;
                        case 5:
                            uploadResult = _a;
                            content = this.contentRepository.create({
                                userId: userId,
                                contentType: type,
                                mediaUrl: uploadResult.secure_url,
                                thumbnailUrl: ((_c = (_b = uploadResult.eager) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.secure_url) || uploadResult.secure_url,
                                caption: createContentDto.description,
                                hashtags: createContentDto.tags || [],
                            });
                            // Update user post count
                            user.postCount += 1;
                            return [4 /*yield*/, this.userRepository.save(user)];
                        case 6:
                            _d.sent();
                            return [2 /*return*/, this.contentRepository.save(content)];
                    }
                });
            });
        };
        ContentService_1.prototype.findAll = function () {
            return __awaiter(this, arguments, void 0, function (page, limit, category, userId) {
                var queryBuilder, _a, content, total;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            queryBuilder = this.contentRepository
                                .createQueryBuilder("content")
                                .leftJoinAndSelect("content.user", "user")
                                .where("content.isActive = :isActive", { isActive: true })
                                .andWhere("user.isActive = :userActive", { userActive: true });
                            if (category) {
                                queryBuilder.andWhere(":category = ANY(content.hashtags)", { category: category });
                            }
                            if (userId) {
                                queryBuilder.andWhere("content.userId = :userId", { userId: userId });
                            }
                            return [4 /*yield*/, queryBuilder
                                    .orderBy("content.createdAt", "DESC")
                                    .skip((page - 1) * limit)
                                    .take(limit)
                                    .getManyAndCount()];
                        case 1:
                            _a = _b.sent(), content = _a[0], total = _a[1];
                            return [2 /*return*/, {
                                    data: content,
                                    total: total,
                                    page: page,
                                    limit: limit,
                                    hasNext: page * limit < total,
                                    hasPrev: page > 1,
                                }];
                    }
                });
            });
        };
        ContentService_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var content;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.contentRepository.findOne({
                                where: { id: id },
                                relations: ["user"],
                            })];
                        case 1:
                            content = _a.sent();
                            if (!content) {
                                throw new common_1.NotFoundException("Content not found");
                            }
                            return [2 /*return*/, content];
                    }
                });
            });
        };
        ContentService_1.prototype.update = function (id, userId, updateContentDto) {
            return __awaiter(this, void 0, void 0, function () {
                var content;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id)];
                        case 1:
                            content = _a.sent();
                            if (content.userId !== userId) {
                                throw new common_1.ForbiddenException("You can only update your own content");
                            }
                            Object.assign(content, updateContentDto);
                            return [2 /*return*/, this.contentRepository.save(content)];
                    }
                });
            });
        };
        ContentService_1.prototype.remove = function (id, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var content;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(id)];
                        case 1:
                            content = _a.sent();
                            if (content.userId !== userId) {
                                throw new common_1.ForbiddenException("You can only delete your own content");
                            }
                            return [4 /*yield*/, this.contentRepository.remove(content)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        ContentService_1.prototype.likeContent = function (contentId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var content, existingLike, interaction;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(contentId)
                            // Check if user already liked this content
                        ];
                        case 1:
                            content = _a.sent();
                            return [4 /*yield*/, this.interactionRepository.findOne({
                                    where: { contentId: contentId, userId: userId, type: "like" },
                                })];
                        case 2:
                            existingLike = _a.sent();
                            if (!existingLike) return [3 /*break*/, 5];
                            // Unlike
                            return [4 /*yield*/, this.interactionRepository.remove(existingLike)];
                        case 3:
                            // Unlike
                            _a.sent();
                            content.likeCount = Math.max(0, content.likeCount - 1);
                            return [4 /*yield*/, this.contentRepository.save(content)];
                        case 4:
                            _a.sent();
                            return [2 /*return*/, { liked: false, likesCount: content.likeCount }];
                        case 5:
                            interaction = this.interactionRepository.create({
                                contentId: contentId,
                                userId: userId,
                                type: "like",
                            });
                            return [4 /*yield*/, this.interactionRepository.save(interaction)];
                        case 6:
                            _a.sent();
                            content.likeCount += 1;
                            return [4 /*yield*/, this.contentRepository.save(content)];
                        case 7:
                            _a.sent();
                            return [2 /*return*/, { liked: true, likesCount: content.likeCount }];
                    }
                });
            });
        };
        ContentService_1.prototype.viewContent = function (contentId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var content, existingView, interaction;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(contentId)
                            // Only count unique views per user
                        ];
                        case 1:
                            content = _a.sent();
                            if (!userId) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.interactionRepository.findOne({
                                    where: { contentId: contentId, userId: userId, type: "view" },
                                })];
                        case 2:
                            existingView = _a.sent();
                            if (!!existingView) return [3 /*break*/, 5];
                            interaction = this.interactionRepository.create({
                                contentId: contentId,
                                userId: userId,
                                type: "view",
                            });
                            return [4 /*yield*/, this.interactionRepository.save(interaction)];
                        case 3:
                            _a.sent();
                            content.viewCount += 1;
                            return [4 /*yield*/, this.contentRepository.save(content)];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5: return [3 /*break*/, 8];
                        case 6:
                            // Anonymous view
                            content.viewCount += 1;
                            return [4 /*yield*/, this.contentRepository.save(content)];
                        case 7:
                            _a.sent();
                            _a.label = 8;
                        case 8: return [2 /*return*/];
                    }
                });
            });
        };
        ContentService_1.prototype.addComment = function (contentId, userId, createCommentDto) {
            return __awaiter(this, void 0, void 0, function () {
                var content, comment, savedComment;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(contentId)];
                        case 1:
                            content = _a.sent();
                            comment = this.commentRepository.create({
                                contentId: contentId,
                                userId: userId,
                                text: createCommentDto.text,
                                parentId: createCommentDto.parentId,
                            });
                            return [4 /*yield*/, this.commentRepository.save(comment)
                                // Update comment count
                            ];
                        case 2:
                            savedComment = _a.sent();
                            // Update comment count
                            content.commentCount += 1;
                            return [4 /*yield*/, this.contentRepository.save(content)];
                        case 3:
                            _a.sent();
                            return [2 /*return*/, this.commentRepository.findOne({
                                    where: { id: savedComment.id },
                                    relations: ["user"],
                                })];
                    }
                });
            });
        };
        ContentService_1.prototype.getComments = function (contentId_1) {
            return __awaiter(this, arguments, void 0, function (contentId, page, limit) {
                var _a, comments, total;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.commentRepository.findAndCount({
                                where: { contentId: contentId, parentId: null }, // Only top-level comments
                                relations: ["user", "replies", "replies.user"],
                                order: { createdAt: "DESC" },
                                skip: (page - 1) * limit,
                                take: limit,
                            })];
                        case 1:
                            _a = _b.sent(), comments = _a[0], total = _a[1];
                            return [2 /*return*/, {
                                    data: comments,
                                    total: total,
                                    page: page,
                                    limit: limit,
                                    hasNext: page * limit < total,
                                    hasPrev: page > 1,
                                }];
                    }
                });
            });
        };
        ContentService_1.prototype.getFeed = function (userId_1) {
            return __awaiter(this, arguments, void 0, function (userId, page, limit) {
                var queryBuilder, _a, contents, total, enrichedContents;
                var _this = this;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            queryBuilder = this.contentRepository
                                .createQueryBuilder("content")
                                .leftJoinAndSelect("content.user", "user")
                                .where("content.isActive = :isActive", { isActive: true })
                                .andWhere("user.isActive = :userActive", { userActive: true });
                            return [4 /*yield*/, queryBuilder
                                    .orderBy("RANDOM()") // Mix content randomly for discovery
                                    .addOrderBy("content.createdAt", "DESC")
                                    .skip((page - 1) * limit)
                                    .take(limit)
                                    .getManyAndCount()];
                        case 1:
                            _a = _b.sent(), contents = _a[0], total = _a[1];
                            return [4 /*yield*/, Promise.all(contents.map(function (content) { return __awaiter(_this, void 0, void 0, function () {
                                    var interactions;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, this.getContentInteractions(content.id, userId)];
                                            case 1:
                                                interactions = _a.sent();
                                                return [2 /*return*/, __assign(__assign({}, content), { user: {
                                                            id: content.user.id,
                                                            name: content.user.displayName || content.user.username,
                                                            avatar: content.user.avatarUrl,
                                                            isVerified: content.user.isVerified,
                                                        }, interactions: interactions })];
                                        }
                                    });
                                }); }))];
                        case 2:
                            enrichedContents = _b.sent();
                            return [2 /*return*/, {
                                    data: enrichedContents,
                                    total: total,
                                    page: page,
                                    limit: limit,
                                    hasNext: page * limit < total,
                                    hasPrev: page > 1,
                                }];
                    }
                });
            });
        };
        ContentService_1.prototype.getContentInteractions = function (contentId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var content, isLiked, isBookmarked, like, bookmark;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.contentRepository.findOne({ where: { id: contentId } })];
                        case 1:
                            content = _a.sent();
                            isLiked = false;
                            isBookmarked = false;
                            if (!userId) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.interactionRepository.findOne({
                                    where: { contentId: contentId, userId: userId, type: "like" },
                                })];
                        case 2:
                            like = _a.sent();
                            return [4 /*yield*/, this.interactionRepository.findOne({
                                    where: { contentId: contentId, userId: userId, type: "bookmark" },
                                })];
                        case 3:
                            bookmark = _a.sent();
                            isLiked = !!like;
                            isBookmarked = !!bookmark;
                            _a.label = 4;
                        case 4: return [2 /*return*/, {
                                likes: content.likeCount,
                                comments: content.commentCount,
                                shares: content.shareCount,
                                views: content.viewCount,
                                isLiked: isLiked,
                                isBookmarked: isBookmarked,
                            }];
                    }
                });
            });
        };
        ContentService_1.prototype.interactWithContent = function (contentId, userId, type) {
            return __awaiter(this, void 0, void 0, function () {
                var content, existingInteraction, interaction;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(contentId)
                            // Check if interaction already exists
                        ];
                        case 1:
                            content = _a.sent();
                            return [4 /*yield*/, this.interactionRepository.findOne({
                                    where: { contentId: contentId, userId: userId, type: type },
                                })];
                        case 2:
                            existingInteraction = _a.sent();
                            if (!existingInteraction) return [3 /*break*/, 5];
                            // Remove interaction (unlike, unbookmark)
                            return [4 /*yield*/, this.interactionRepository.remove(existingInteraction)];
                        case 3:
                            // Remove interaction (unlike, unbookmark)
                            _a.sent();
                            if (type === "like") {
                                content.likeCount = Math.max(0, content.likeCount - 1);
                            }
                            else if (type === "share") {
                                content.shareCount = Math.max(0, content.shareCount - 1);
                            }
                            return [4 /*yield*/, this.contentRepository.save(content)];
                        case 4:
                            _a.sent();
                            return [2 /*return*/, { success: true, action: "removed", type: type }];
                        case 5:
                            interaction = this.interactionRepository.create({
                                contentId: contentId,
                                userId: userId,
                                type: type,
                            });
                            return [4 /*yield*/, this.interactionRepository.save(interaction)];
                        case 6:
                            _a.sent();
                            if (type === "like") {
                                content.likeCount += 1;
                            }
                            else if (type === "share") {
                                content.shareCount += 1;
                            }
                            return [4 /*yield*/, this.contentRepository.save(content)];
                        case 7:
                            _a.sent();
                            return [2 /*return*/, { success: true, action: "added", type: type }];
                    }
                });
            });
        };
        return ContentService_1;
    }());
    __setFunctionName(_classThis, "ContentService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ContentService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ContentService = _classThis;
}();
exports.ContentService = ContentService;
