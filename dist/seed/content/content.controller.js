"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
exports.ContentController = void 0;
var common_1 = require("@nestjs/common");
var platform_express_1 = require("@nestjs/platform-express");
var swagger_1 = require("@nestjs/swagger");
var jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
var ContentController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)("Content"), (0, common_1.Controller)("content")];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _create_decorators;
    var _findAll_decorators;
    var _findOne_decorators;
    var _update_decorators;
    var _remove_decorators;
    var _likeContent_decorators;
    var _addComment_decorators;
    var _getComments_decorators;
    var _getFeed_decorators;
    var _interactWithContent_decorators;
    var ContentController = _classThis = /** @class */ (function () {
        function ContentController_1(contentService) {
            this.contentService = (__runInitializers(this, _instanceExtraInitializers), contentService);
        }
        ContentController_1.prototype.create = function (req, createContentDto, file) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (!file) {
                        throw new common_1.BadRequestException("File is required");
                    }
                    return [2 /*return*/, this.contentService.create(req.user.id, createContentDto, file)];
                });
            });
        };
        ContentController_1.prototype.findAll = function (page, limit, category, userId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.contentService.findAll(page, limit, category, userId)];
                });
            });
        };
        ContentController_1.prototype.findOne = function (id, req) {
            return __awaiter(this, void 0, void 0, function () {
                var content, userId;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.contentService.findOne(id)
                            // Track view
                        ];
                        case 1:
                            content = _b.sent();
                            userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                            return [4 /*yield*/, this.contentService.viewContent(id, userId)];
                        case 2:
                            _b.sent();
                            return [2 /*return*/, content];
                    }
                });
            });
        };
        ContentController_1.prototype.update = function (id, req, updateContentDto) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.contentService.update(id, req.user.id, updateContentDto)];
                });
            });
        };
        ContentController_1.prototype.remove = function (id, req) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.contentService.remove(id, req.user.id)];
                });
            });
        };
        ContentController_1.prototype.likeContent = function (id, req) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.contentService.likeContent(id, req.user.id)];
                });
            });
        };
        ContentController_1.prototype.addComment = function (id, req, createCommentDto) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.contentService.addComment(id, req.user.id, createCommentDto)];
                });
            });
        };
        ContentController_1.prototype.getComments = function (id, page, limit) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.contentService.getComments(id, page, limit)];
                });
            });
        };
        ContentController_1.prototype.getFeed = function (page, limit, req) {
            return __awaiter(this, void 0, void 0, function () {
                var userId;
                var _a;
                return __generator(this, function (_b) {
                    userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                    return [2 /*return*/, this.contentService.getFeed(userId, page, limit)];
                });
            });
        };
        ContentController_1.prototype.interactWithContent = function (id, req, body) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.contentService.interactWithContent(id, req.user.id, body.type)];
                });
            });
        };
        return ContentController_1;
    }());
    __setFunctionName(_classThis, "ContentController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _create_decorators = [(0, common_1.Post)(), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")), (0, swagger_1.ApiConsumes)("multipart/form-data"), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: "Upload new content" }), (0, swagger_1.ApiResponse)({ status: 201, description: "Content uploaded successfully" })];
        _findAll_decorators = [(0, common_1.Get)(), (0, swagger_1.ApiOperation)({ summary: "Get all public content" }), (0, swagger_1.ApiQuery)({ name: "page", required: false, type: Number }), (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number }), (0, swagger_1.ApiQuery)({ name: "category", required: false, type: String }), (0, swagger_1.ApiQuery)({ name: "userId", required: false, type: String })];
        _findOne_decorators = [(0, common_1.Get)(":id"), (0, swagger_1.ApiOperation)({ summary: "Get content by ID" }), (0, swagger_1.ApiResponse)({ status: 200, description: "Content retrieved successfully" }), (0, swagger_1.ApiResponse)({ status: 404, description: "Content not found" })];
        _update_decorators = [(0, common_1.Patch)(":id"), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: "Update content" }), (0, swagger_1.ApiResponse)({ status: 200, description: "Content updated successfully" })];
        _remove_decorators = [(0, common_1.Delete)(":id"), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: "Delete content" }), (0, swagger_1.ApiResponse)({ status: 200, description: "Content deleted successfully" })];
        _likeContent_decorators = [(0, common_1.Post)(":id/like"), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: "Like or unlike content" }), (0, swagger_1.ApiResponse)({ status: 200, description: "Content like status updated" })];
        _addComment_decorators = [(0, common_1.Post)(":id/comments"), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: "Add comment to content" }), (0, swagger_1.ApiResponse)({ status: 201, description: "Comment added successfully" })];
        _getComments_decorators = [(0, common_1.Get)(":id/comments"), (0, swagger_1.ApiOperation)({ summary: "Get content comments" }), (0, swagger_1.ApiQuery)({ name: "page", required: false, type: Number }), (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number })];
        _getFeed_decorators = [(0, common_1.Get)("feed"), (0, swagger_1.ApiOperation)({ summary: "Get personalized content feed" }), (0, swagger_1.ApiQuery)({ name: "page", required: false, type: Number }), (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number })];
        _interactWithContent_decorators = [(0, common_1.Post)(":id/interact"), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: "Interact with content (like, bookmark, share)" }), (0, swagger_1.ApiResponse)({ status: 200, description: "Interaction recorded successfully" })];
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: function (obj) { return "create" in obj; }, get: function (obj) { return obj.create; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: function (obj) { return "findAll" in obj; }, get: function (obj) { return obj.findAll; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: function (obj) { return "findOne" in obj; }, get: function (obj) { return obj.findOne; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: function (obj) { return "update" in obj; }, get: function (obj) { return obj.update; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: function (obj) { return "remove" in obj; }, get: function (obj) { return obj.remove; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _likeContent_decorators, { kind: "method", name: "likeContent", static: false, private: false, access: { has: function (obj) { return "likeContent" in obj; }, get: function (obj) { return obj.likeContent; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _addComment_decorators, { kind: "method", name: "addComment", static: false, private: false, access: { has: function (obj) { return "addComment" in obj; }, get: function (obj) { return obj.addComment; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getComments_decorators, { kind: "method", name: "getComments", static: false, private: false, access: { has: function (obj) { return "getComments" in obj; }, get: function (obj) { return obj.getComments; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getFeed_decorators, { kind: "method", name: "getFeed", static: false, private: false, access: { has: function (obj) { return "getFeed" in obj; }, get: function (obj) { return obj.getFeed; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _interactWithContent_decorators, { kind: "method", name: "interactWithContent", static: false, private: false, access: { has: function (obj) { return "interactWithContent" in obj; }, get: function (obj) { return obj.interactWithContent; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ContentController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ContentController = _classThis;
}();
exports.ContentController = ContentController;
