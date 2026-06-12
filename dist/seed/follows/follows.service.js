"use strict";
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
exports.FollowsService = void 0;
var common_1 = require("@nestjs/common");
var FollowsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var FollowsService = _classThis = /** @class */ (function () {
        function FollowsService_1(followRepository, userRepository) {
            this.followRepository = followRepository;
            this.userRepository = userRepository;
        }
        FollowsService_1.prototype.followUser = function (followerId, followingId) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, follower, following, existingFollow, follow;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            // Prevent self-follow
                            if (followerId === followingId) {
                                throw new common_1.ConflictException("You cannot follow yourself");
                            }
                            return [4 /*yield*/, Promise.all([
                                    this.userRepository.findOne({ where: { id: followerId } }),
                                    this.userRepository.findOne({ where: { id: followingId } }),
                                ])];
                        case 1:
                            _a = _b.sent(), follower = _a[0], following = _a[1];
                            if (!follower || !following) {
                                throw new common_1.NotFoundException("User not found");
                            }
                            return [4 /*yield*/, this.followRepository.findOne({
                                    where: { followerId: followerId, followingId: followingId },
                                })];
                        case 2:
                            existingFollow = _b.sent();
                            if (existingFollow) {
                                throw new common_1.ConflictException("You are already following this user");
                            }
                            follow = this.followRepository.create({ followerId: followerId, followingId: followingId });
                            return [4 /*yield*/, this.followRepository.save(follow)
                                // Update follower counts
                            ];
                        case 3:
                            _b.sent();
                            // Update follower counts
                            follower.followingCount += 1;
                            following.followersCount += 1;
                            return [4 /*yield*/, Promise.all([this.userRepository.save(follower), this.userRepository.save(following)])];
                        case 4:
                            _b.sent();
                            return [2 /*return*/, { success: true, message: "Successfully followed user" }];
                    }
                });
            });
        };
        FollowsService_1.prototype.unfollowUser = function (followerId, followingId) {
            return __awaiter(this, void 0, void 0, function () {
                var follow, _a, follower, following;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.followRepository.findOne({
                                where: { followerId: followerId, followingId: followingId },
                            })];
                        case 1:
                            follow = _b.sent();
                            if (!follow) {
                                throw new common_1.NotFoundException("You are not following this user");
                            }
                            // Delete follow relationship
                            return [4 /*yield*/, this.followRepository.remove(follow)
                                // Update follower counts
                            ];
                        case 2:
                            // Delete follow relationship
                            _b.sent();
                            return [4 /*yield*/, Promise.all([
                                    this.userRepository.findOne({ where: { id: followerId } }),
                                    this.userRepository.findOne({ where: { id: followingId } }),
                                ])];
                        case 3:
                            _a = _b.sent(), follower = _a[0], following = _a[1];
                            if (!(follower && following)) return [3 /*break*/, 5];
                            follower.followingCount = Math.max(0, follower.followingCount - 1);
                            following.followersCount = Math.max(0, following.followersCount - 1);
                            return [4 /*yield*/, Promise.all([this.userRepository.save(follower), this.userRepository.save(following)])];
                        case 4:
                            _b.sent();
                            _b.label = 5;
                        case 5: return [2 /*return*/, { success: true, message: "Successfully unfollowed user" }];
                    }
                });
            });
        };
        FollowsService_1.prototype.getFollowers = function (userId_1) {
            return __awaiter(this, arguments, void 0, function (userId, page, limit) {
                var _a, follows, total, followers;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.followRepository.findAndCount({
                                where: { followingId: userId },
                                relations: ["follower"],
                                skip: (page - 1) * limit,
                                take: limit,
                                order: { createdAt: "DESC" },
                            })];
                        case 1:
                            _a = _b.sent(), follows = _a[0], total = _a[1];
                            followers = follows.map(function (follow) { return ({
                                id: follow.follower.id,
                                username: follow.follower.username,
                                displayName: follow.follower.displayName,
                                avatarUrl: follow.follower.avatarUrl,
                                isVerified: follow.follower.isVerified,
                                followedAt: follow.createdAt,
                            }); });
                            return [2 /*return*/, {
                                    data: followers,
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
        FollowsService_1.prototype.getFollowing = function (userId_1) {
            return __awaiter(this, arguments, void 0, function (userId, page, limit) {
                var _a, follows, total, following;
                if (page === void 0) { page = 1; }
                if (limit === void 0) { limit = 20; }
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.followRepository.findAndCount({
                                where: { followerId: userId },
                                relations: ["following"],
                                skip: (page - 1) * limit,
                                take: limit,
                                order: { createdAt: "DESC" },
                            })];
                        case 1:
                            _a = _b.sent(), follows = _a[0], total = _a[1];
                            following = follows.map(function (follow) { return ({
                                id: follow.following.id,
                                username: follow.following.username,
                                displayName: follow.following.displayName,
                                avatarUrl: follow.following.avatarUrl,
                                isVerified: follow.following.isVerified,
                                followedAt: follow.createdAt,
                            }); });
                            return [2 /*return*/, {
                                    data: following,
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
        FollowsService_1.prototype.isFollowing = function (followerId, followingId) {
            return __awaiter(this, void 0, void 0, function () {
                var follow;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.followRepository.findOne({
                                where: { followerId: followerId, followingId: followingId },
                            })];
                        case 1:
                            follow = _a.sent();
                            return [2 /*return*/, !!follow];
                    }
                });
            });
        };
        FollowsService_1.prototype.getFollowStats = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.userRepository.findOne({ where: { id: userId } })];
                        case 1:
                            user = _a.sent();
                            if (!user) {
                                throw new common_1.NotFoundException("User not found");
                            }
                            return [2 /*return*/, {
                                    followersCount: user.followersCount,
                                    followingCount: user.followingCount,
                                }];
                    }
                });
            });
        };
        return FollowsService_1;
    }());
    __setFunctionName(_classThis, "FollowsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        FollowsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return FollowsService = _classThis;
}();
exports.FollowsService = FollowsService;
