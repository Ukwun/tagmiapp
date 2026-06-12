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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Content = void 0;
var typeorm_1 = require("typeorm");
var user_entity_1 = require("./user.entity");
var content_interaction_entity_1 = require("./content-interaction.entity");
var comment_entity_1 = require("./comment.entity");
var Content = function () {
    var _classDecorators = [(0, typeorm_1.Entity)("content")];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _userId_decorators;
    var _userId_initializers = [];
    var _userId_extraInitializers = [];
    var _contentType_decorators;
    var _contentType_initializers = [];
    var _contentType_extraInitializers = [];
    var _mediaUrl_decorators;
    var _mediaUrl_initializers = [];
    var _mediaUrl_extraInitializers = [];
    var _thumbnailUrl_decorators;
    var _thumbnailUrl_initializers = [];
    var _thumbnailUrl_extraInitializers = [];
    var _caption_decorators;
    var _caption_initializers = [];
    var _caption_extraInitializers = [];
    var _backgroundColor_decorators;
    var _backgroundColor_initializers = [];
    var _backgroundColor_extraInitializers = [];
    var _hashtags_decorators;
    var _hashtags_initializers = [];
    var _hashtags_extraInitializers = [];
    var _duration_decorators;
    var _duration_initializers = [];
    var _duration_extraInitializers = [];
    var _isSplitVideo_decorators;
    var _isSplitVideo_initializers = [];
    var _isSplitVideo_extraInitializers = [];
    var _parentContentId_decorators;
    var _parentContentId_initializers = [];
    var _parentContentId_extraInitializers = [];
    var _sequenceNumber_decorators;
    var _sequenceNumber_initializers = [];
    var _sequenceNumber_extraInitializers = [];
    var _totalParts_decorators;
    var _totalParts_initializers = [];
    var _totalParts_extraInitializers = [];
    var _viewCount_decorators;
    var _viewCount_initializers = [];
    var _viewCount_extraInitializers = [];
    var _likeCount_decorators;
    var _likeCount_initializers = [];
    var _likeCount_extraInitializers = [];
    var _commentCount_decorators;
    var _commentCount_initializers = [];
    var _commentCount_extraInitializers = [];
    var _shareCount_decorators;
    var _shareCount_initializers = [];
    var _shareCount_extraInitializers = [];
    var _isActive_decorators;
    var _isActive_initializers = [];
    var _isActive_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var _updatedAt_extraInitializers = [];
    var _user_decorators;
    var _user_initializers = [];
    var _user_extraInitializers = [];
    var _parentContent_decorators;
    var _parentContent_initializers = [];
    var _parentContent_extraInitializers = [];
    var _childParts_decorators;
    var _childParts_initializers = [];
    var _childParts_extraInitializers = [];
    var _interactions_decorators;
    var _interactions_initializers = [];
    var _interactions_extraInitializers = [];
    var _contentComments_decorators;
    var _contentComments_initializers = [];
    var _contentComments_extraInitializers = [];
    var Content = _classThis = /** @class */ (function () {
        function Content_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.userId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _userId_initializers, void 0));
            this.contentType = (__runInitializers(this, _userId_extraInitializers), __runInitializers(this, _contentType_initializers, void 0));
            this.mediaUrl = (__runInitializers(this, _contentType_extraInitializers), __runInitializers(this, _mediaUrl_initializers, void 0));
            this.thumbnailUrl = (__runInitializers(this, _mediaUrl_extraInitializers), __runInitializers(this, _thumbnailUrl_initializers, void 0));
            this.caption = (__runInitializers(this, _thumbnailUrl_extraInitializers), __runInitializers(this, _caption_initializers, void 0));
            this.backgroundColor = (__runInitializers(this, _caption_extraInitializers), __runInitializers(this, _backgroundColor_initializers, void 0)); // For text-only posts
            this.hashtags = (__runInitializers(this, _backgroundColor_extraInitializers), __runInitializers(this, _hashtags_initializers, void 0));
            this.duration = (__runInitializers(this, _hashtags_extraInitializers), __runInitializers(this, _duration_initializers, void 0)); // For video/audio in seconds
            // Video splitting support
            this.isSplitVideo = (__runInitializers(this, _duration_extraInitializers), __runInitializers(this, _isSplitVideo_initializers, void 0));
            this.parentContentId = (__runInitializers(this, _isSplitVideo_extraInitializers), __runInitializers(this, _parentContentId_initializers, void 0));
            this.sequenceNumber = (__runInitializers(this, _parentContentId_extraInitializers), __runInitializers(this, _sequenceNumber_initializers, void 0)); // Part 1, 2, 3...
            this.totalParts = (__runInitializers(this, _sequenceNumber_extraInitializers), __runInitializers(this, _totalParts_initializers, void 0));
            // Engagement metrics
            this.viewCount = (__runInitializers(this, _totalParts_extraInitializers), __runInitializers(this, _viewCount_initializers, void 0));
            this.likeCount = (__runInitializers(this, _viewCount_extraInitializers), __runInitializers(this, _likeCount_initializers, void 0));
            this.commentCount = (__runInitializers(this, _likeCount_extraInitializers), __runInitializers(this, _commentCount_initializers, void 0));
            this.shareCount = (__runInitializers(this, _commentCount_extraInitializers), __runInitializers(this, _shareCount_initializers, void 0));
            this.isActive = (__runInitializers(this, _shareCount_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
            this.createdAt = (__runInitializers(this, _isActive_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            this.user = (__runInitializers(this, _updatedAt_extraInitializers), __runInitializers(this, _user_initializers, void 0));
            this.parentContent = (__runInitializers(this, _user_extraInitializers), __runInitializers(this, _parentContent_initializers, void 0));
            this.childParts = (__runInitializers(this, _parentContent_extraInitializers), __runInitializers(this, _childParts_initializers, void 0));
            this.interactions = (__runInitializers(this, _childParts_extraInitializers), __runInitializers(this, _interactions_initializers, void 0));
            this.contentComments = (__runInitializers(this, _interactions_extraInitializers), __runInitializers(this, _contentComments_initializers, void 0));
            __runInitializers(this, _contentComments_extraInitializers);
        }
        return Content_1;
    }());
    __setFunctionName(_classThis, "Content");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)("uuid")];
        _userId_decorators = [(0, typeorm_1.Column)("uuid")];
        _contentType_decorators = [(0, typeorm_1.Column)({ type: "enum", enum: ["text", "image", "video", "audio"] })];
        _mediaUrl_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _thumbnailUrl_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _caption_decorators = [(0, typeorm_1.Column)({ type: "text", nullable: true })];
        _backgroundColor_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _hashtags_decorators = [(0, typeorm_1.Column)({ type: "simple-array", nullable: true })];
        _duration_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _isSplitVideo_decorators = [(0, typeorm_1.Column)({ default: false })];
        _parentContentId_decorators = [(0, typeorm_1.Column)({ type: "uuid", nullable: true })];
        _sequenceNumber_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _totalParts_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _viewCount_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _likeCount_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _commentCount_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _shareCount_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _isActive_decorators = [(0, typeorm_1.Column)({ default: true })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)()];
        _user_decorators = [(0, typeorm_1.ManyToOne)(function () { return user_entity_1.User; }, function (user) { return user.content; }), (0, typeorm_1.JoinColumn)({ name: "userId" })];
        _parentContent_decorators = [(0, typeorm_1.ManyToOne)(function () { return Content; }, { nullable: true }), (0, typeorm_1.JoinColumn)({ name: "parentContentId" })];
        _childParts_decorators = [(0, typeorm_1.OneToMany)(function () { return Content; }, function (content) { return content.parentContent; })];
        _interactions_decorators = [(0, typeorm_1.OneToMany)(function () { return content_interaction_entity_1.ContentInteraction; }, function (interaction) { return interaction.content; })];
        _contentComments_decorators = [(0, typeorm_1.OneToMany)(function () { return comment_entity_1.Comment; }, function (comment) { return comment.content; })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _userId_decorators, { kind: "field", name: "userId", static: false, private: false, access: { has: function (obj) { return "userId" in obj; }, get: function (obj) { return obj.userId; }, set: function (obj, value) { obj.userId = value; } }, metadata: _metadata }, _userId_initializers, _userId_extraInitializers);
        __esDecorate(null, null, _contentType_decorators, { kind: "field", name: "contentType", static: false, private: false, access: { has: function (obj) { return "contentType" in obj; }, get: function (obj) { return obj.contentType; }, set: function (obj, value) { obj.contentType = value; } }, metadata: _metadata }, _contentType_initializers, _contentType_extraInitializers);
        __esDecorate(null, null, _mediaUrl_decorators, { kind: "field", name: "mediaUrl", static: false, private: false, access: { has: function (obj) { return "mediaUrl" in obj; }, get: function (obj) { return obj.mediaUrl; }, set: function (obj, value) { obj.mediaUrl = value; } }, metadata: _metadata }, _mediaUrl_initializers, _mediaUrl_extraInitializers);
        __esDecorate(null, null, _thumbnailUrl_decorators, { kind: "field", name: "thumbnailUrl", static: false, private: false, access: { has: function (obj) { return "thumbnailUrl" in obj; }, get: function (obj) { return obj.thumbnailUrl; }, set: function (obj, value) { obj.thumbnailUrl = value; } }, metadata: _metadata }, _thumbnailUrl_initializers, _thumbnailUrl_extraInitializers);
        __esDecorate(null, null, _caption_decorators, { kind: "field", name: "caption", static: false, private: false, access: { has: function (obj) { return "caption" in obj; }, get: function (obj) { return obj.caption; }, set: function (obj, value) { obj.caption = value; } }, metadata: _metadata }, _caption_initializers, _caption_extraInitializers);
        __esDecorate(null, null, _backgroundColor_decorators, { kind: "field", name: "backgroundColor", static: false, private: false, access: { has: function (obj) { return "backgroundColor" in obj; }, get: function (obj) { return obj.backgroundColor; }, set: function (obj, value) { obj.backgroundColor = value; } }, metadata: _metadata }, _backgroundColor_initializers, _backgroundColor_extraInitializers);
        __esDecorate(null, null, _hashtags_decorators, { kind: "field", name: "hashtags", static: false, private: false, access: { has: function (obj) { return "hashtags" in obj; }, get: function (obj) { return obj.hashtags; }, set: function (obj, value) { obj.hashtags = value; } }, metadata: _metadata }, _hashtags_initializers, _hashtags_extraInitializers);
        __esDecorate(null, null, _duration_decorators, { kind: "field", name: "duration", static: false, private: false, access: { has: function (obj) { return "duration" in obj; }, get: function (obj) { return obj.duration; }, set: function (obj, value) { obj.duration = value; } }, metadata: _metadata }, _duration_initializers, _duration_extraInitializers);
        __esDecorate(null, null, _isSplitVideo_decorators, { kind: "field", name: "isSplitVideo", static: false, private: false, access: { has: function (obj) { return "isSplitVideo" in obj; }, get: function (obj) { return obj.isSplitVideo; }, set: function (obj, value) { obj.isSplitVideo = value; } }, metadata: _metadata }, _isSplitVideo_initializers, _isSplitVideo_extraInitializers);
        __esDecorate(null, null, _parentContentId_decorators, { kind: "field", name: "parentContentId", static: false, private: false, access: { has: function (obj) { return "parentContentId" in obj; }, get: function (obj) { return obj.parentContentId; }, set: function (obj, value) { obj.parentContentId = value; } }, metadata: _metadata }, _parentContentId_initializers, _parentContentId_extraInitializers);
        __esDecorate(null, null, _sequenceNumber_decorators, { kind: "field", name: "sequenceNumber", static: false, private: false, access: { has: function (obj) { return "sequenceNumber" in obj; }, get: function (obj) { return obj.sequenceNumber; }, set: function (obj, value) { obj.sequenceNumber = value; } }, metadata: _metadata }, _sequenceNumber_initializers, _sequenceNumber_extraInitializers);
        __esDecorate(null, null, _totalParts_decorators, { kind: "field", name: "totalParts", static: false, private: false, access: { has: function (obj) { return "totalParts" in obj; }, get: function (obj) { return obj.totalParts; }, set: function (obj, value) { obj.totalParts = value; } }, metadata: _metadata }, _totalParts_initializers, _totalParts_extraInitializers);
        __esDecorate(null, null, _viewCount_decorators, { kind: "field", name: "viewCount", static: false, private: false, access: { has: function (obj) { return "viewCount" in obj; }, get: function (obj) { return obj.viewCount; }, set: function (obj, value) { obj.viewCount = value; } }, metadata: _metadata }, _viewCount_initializers, _viewCount_extraInitializers);
        __esDecorate(null, null, _likeCount_decorators, { kind: "field", name: "likeCount", static: false, private: false, access: { has: function (obj) { return "likeCount" in obj; }, get: function (obj) { return obj.likeCount; }, set: function (obj, value) { obj.likeCount = value; } }, metadata: _metadata }, _likeCount_initializers, _likeCount_extraInitializers);
        __esDecorate(null, null, _commentCount_decorators, { kind: "field", name: "commentCount", static: false, private: false, access: { has: function (obj) { return "commentCount" in obj; }, get: function (obj) { return obj.commentCount; }, set: function (obj, value) { obj.commentCount = value; } }, metadata: _metadata }, _commentCount_initializers, _commentCount_extraInitializers);
        __esDecorate(null, null, _shareCount_decorators, { kind: "field", name: "shareCount", static: false, private: false, access: { has: function (obj) { return "shareCount" in obj; }, get: function (obj) { return obj.shareCount; }, set: function (obj, value) { obj.shareCount = value; } }, metadata: _metadata }, _shareCount_initializers, _shareCount_extraInitializers);
        __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: function (obj) { return "isActive" in obj; }, get: function (obj) { return obj.isActive; }, set: function (obj, value) { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, null, _user_decorators, { kind: "field", name: "user", static: false, private: false, access: { has: function (obj) { return "user" in obj; }, get: function (obj) { return obj.user; }, set: function (obj, value) { obj.user = value; } }, metadata: _metadata }, _user_initializers, _user_extraInitializers);
        __esDecorate(null, null, _parentContent_decorators, { kind: "field", name: "parentContent", static: false, private: false, access: { has: function (obj) { return "parentContent" in obj; }, get: function (obj) { return obj.parentContent; }, set: function (obj, value) { obj.parentContent = value; } }, metadata: _metadata }, _parentContent_initializers, _parentContent_extraInitializers);
        __esDecorate(null, null, _childParts_decorators, { kind: "field", name: "childParts", static: false, private: false, access: { has: function (obj) { return "childParts" in obj; }, get: function (obj) { return obj.childParts; }, set: function (obj, value) { obj.childParts = value; } }, metadata: _metadata }, _childParts_initializers, _childParts_extraInitializers);
        __esDecorate(null, null, _interactions_decorators, { kind: "field", name: "interactions", static: false, private: false, access: { has: function (obj) { return "interactions" in obj; }, get: function (obj) { return obj.interactions; }, set: function (obj, value) { obj.interactions = value; } }, metadata: _metadata }, _interactions_initializers, _interactions_extraInitializers);
        __esDecorate(null, null, _contentComments_decorators, { kind: "field", name: "contentComments", static: false, private: false, access: { has: function (obj) { return "contentComments" in obj; }, get: function (obj) { return obj.contentComments; }, set: function (obj, value) { obj.contentComments = value; } }, metadata: _metadata }, _contentComments_initializers, _contentComments_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Content = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Content = _classThis;
}();
exports.Content = Content;
