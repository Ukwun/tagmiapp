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
exports.TalentProfile = void 0;
var typeorm_1 = require("typeorm");
var user_entity_1 = require("./user.entity");
var TalentProfile = function () {
    var _classDecorators = [(0, typeorm_1.Entity)("talent_profiles")];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _userId_decorators;
    var _userId_initializers = [];
    var _userId_extraInitializers = [];
    var _bio_decorators;
    var _bio_initializers = [];
    var _bio_extraInitializers = [];
    var _skills_decorators;
    var _skills_initializers = [];
    var _skills_extraInitializers = [];
    var _categories_decorators;
    var _categories_initializers = [];
    var _categories_extraInitializers = [];
    var _hourlyRate_decorators;
    var _hourlyRate_initializers = [];
    var _hourlyRate_extraInitializers = [];
    var _location_decorators;
    var _location_initializers = [];
    var _location_extraInitializers = [];
    var _languages_decorators;
    var _languages_initializers = [];
    var _languages_extraInitializers = [];
    var _portfolioUrl_decorators;
    var _portfolioUrl_initializers = [];
    var _portfolioUrl_extraInitializers = [];
    var _socialLinks_decorators;
    var _socialLinks_initializers = [];
    var _socialLinks_extraInitializers = [];
    var _rating_decorators;
    var _rating_initializers = [];
    var _rating_extraInitializers = [];
    var _totalBookings_decorators;
    var _totalBookings_initializers = [];
    var _totalBookings_extraInitializers = [];
    var _responseTime_decorators;
    var _responseTime_initializers = [];
    var _responseTime_extraInitializers = [];
    var _isAvailable_decorators;
    var _isAvailable_initializers = [];
    var _isAvailable_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var _updatedAt_extraInitializers = [];
    var _user_decorators;
    var _user_initializers = [];
    var _user_extraInitializers = [];
    var TalentProfile = _classThis = /** @class */ (function () {
        function TalentProfile_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.userId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _userId_initializers, void 0));
            this.bio = (__runInitializers(this, _userId_extraInitializers), __runInitializers(this, _bio_initializers, void 0));
            this.skills = (__runInitializers(this, _bio_extraInitializers), __runInitializers(this, _skills_initializers, void 0));
            this.categories = (__runInitializers(this, _skills_extraInitializers), __runInitializers(this, _categories_initializers, void 0));
            this.hourlyRate = (__runInitializers(this, _categories_extraInitializers), __runInitializers(this, _hourlyRate_initializers, void 0));
            this.location = (__runInitializers(this, _hourlyRate_extraInitializers), __runInitializers(this, _location_initializers, void 0));
            this.languages = (__runInitializers(this, _location_extraInitializers), __runInitializers(this, _languages_initializers, void 0));
            this.portfolioUrl = (__runInitializers(this, _languages_extraInitializers), __runInitializers(this, _portfolioUrl_initializers, void 0));
            this.socialLinks = (__runInitializers(this, _portfolioUrl_extraInitializers), __runInitializers(this, _socialLinks_initializers, void 0));
            this.rating = (__runInitializers(this, _socialLinks_extraInitializers), __runInitializers(this, _rating_initializers, void 0));
            this.totalBookings = (__runInitializers(this, _rating_extraInitializers), __runInitializers(this, _totalBookings_initializers, void 0));
            this.responseTime = (__runInitializers(this, _totalBookings_extraInitializers), __runInitializers(this, _responseTime_initializers, void 0));
            this.isAvailable = (__runInitializers(this, _responseTime_extraInitializers), __runInitializers(this, _isAvailable_initializers, void 0));
            this.createdAt = (__runInitializers(this, _isAvailable_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            this.user = (__runInitializers(this, _updatedAt_extraInitializers), __runInitializers(this, _user_initializers, void 0));
            __runInitializers(this, _user_extraInitializers);
        }
        return TalentProfile_1;
    }());
    __setFunctionName(_classThis, "TalentProfile");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)("uuid")];
        _userId_decorators = [(0, typeorm_1.Column)("uuid")];
        _bio_decorators = [(0, typeorm_1.Column)({ type: "text", nullable: true })];
        _skills_decorators = [(0, typeorm_1.Column)({ type: "json", default: [] })];
        _categories_decorators = [(0, typeorm_1.Column)({ type: "json", default: [] })];
        _hourlyRate_decorators = [(0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, nullable: true })];
        _location_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _languages_decorators = [(0, typeorm_1.Column)({ type: "json", default: [] })];
        _portfolioUrl_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _socialLinks_decorators = [(0, typeorm_1.Column)({ type: "json", default: {} })];
        _rating_decorators = [(0, typeorm_1.Column)({ type: "decimal", precision: 3, scale: 2, default: 0 })];
        _totalBookings_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _responseTime_decorators = [(0, typeorm_1.Column)({ default: 60 })];
        _isAvailable_decorators = [(0, typeorm_1.Column)({ default: true })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)()];
        _user_decorators = [(0, typeorm_1.OneToOne)(function () { return user_entity_1.User; }), (0, typeorm_1.JoinColumn)({ name: "userId" })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _userId_decorators, { kind: "field", name: "userId", static: false, private: false, access: { has: function (obj) { return "userId" in obj; }, get: function (obj) { return obj.userId; }, set: function (obj, value) { obj.userId = value; } }, metadata: _metadata }, _userId_initializers, _userId_extraInitializers);
        __esDecorate(null, null, _bio_decorators, { kind: "field", name: "bio", static: false, private: false, access: { has: function (obj) { return "bio" in obj; }, get: function (obj) { return obj.bio; }, set: function (obj, value) { obj.bio = value; } }, metadata: _metadata }, _bio_initializers, _bio_extraInitializers);
        __esDecorate(null, null, _skills_decorators, { kind: "field", name: "skills", static: false, private: false, access: { has: function (obj) { return "skills" in obj; }, get: function (obj) { return obj.skills; }, set: function (obj, value) { obj.skills = value; } }, metadata: _metadata }, _skills_initializers, _skills_extraInitializers);
        __esDecorate(null, null, _categories_decorators, { kind: "field", name: "categories", static: false, private: false, access: { has: function (obj) { return "categories" in obj; }, get: function (obj) { return obj.categories; }, set: function (obj, value) { obj.categories = value; } }, metadata: _metadata }, _categories_initializers, _categories_extraInitializers);
        __esDecorate(null, null, _hourlyRate_decorators, { kind: "field", name: "hourlyRate", static: false, private: false, access: { has: function (obj) { return "hourlyRate" in obj; }, get: function (obj) { return obj.hourlyRate; }, set: function (obj, value) { obj.hourlyRate = value; } }, metadata: _metadata }, _hourlyRate_initializers, _hourlyRate_extraInitializers);
        __esDecorate(null, null, _location_decorators, { kind: "field", name: "location", static: false, private: false, access: { has: function (obj) { return "location" in obj; }, get: function (obj) { return obj.location; }, set: function (obj, value) { obj.location = value; } }, metadata: _metadata }, _location_initializers, _location_extraInitializers);
        __esDecorate(null, null, _languages_decorators, { kind: "field", name: "languages", static: false, private: false, access: { has: function (obj) { return "languages" in obj; }, get: function (obj) { return obj.languages; }, set: function (obj, value) { obj.languages = value; } }, metadata: _metadata }, _languages_initializers, _languages_extraInitializers);
        __esDecorate(null, null, _portfolioUrl_decorators, { kind: "field", name: "portfolioUrl", static: false, private: false, access: { has: function (obj) { return "portfolioUrl" in obj; }, get: function (obj) { return obj.portfolioUrl; }, set: function (obj, value) { obj.portfolioUrl = value; } }, metadata: _metadata }, _portfolioUrl_initializers, _portfolioUrl_extraInitializers);
        __esDecorate(null, null, _socialLinks_decorators, { kind: "field", name: "socialLinks", static: false, private: false, access: { has: function (obj) { return "socialLinks" in obj; }, get: function (obj) { return obj.socialLinks; }, set: function (obj, value) { obj.socialLinks = value; } }, metadata: _metadata }, _socialLinks_initializers, _socialLinks_extraInitializers);
        __esDecorate(null, null, _rating_decorators, { kind: "field", name: "rating", static: false, private: false, access: { has: function (obj) { return "rating" in obj; }, get: function (obj) { return obj.rating; }, set: function (obj, value) { obj.rating = value; } }, metadata: _metadata }, _rating_initializers, _rating_extraInitializers);
        __esDecorate(null, null, _totalBookings_decorators, { kind: "field", name: "totalBookings", static: false, private: false, access: { has: function (obj) { return "totalBookings" in obj; }, get: function (obj) { return obj.totalBookings; }, set: function (obj, value) { obj.totalBookings = value; } }, metadata: _metadata }, _totalBookings_initializers, _totalBookings_extraInitializers);
        __esDecorate(null, null, _responseTime_decorators, { kind: "field", name: "responseTime", static: false, private: false, access: { has: function (obj) { return "responseTime" in obj; }, get: function (obj) { return obj.responseTime; }, set: function (obj, value) { obj.responseTime = value; } }, metadata: _metadata }, _responseTime_initializers, _responseTime_extraInitializers);
        __esDecorate(null, null, _isAvailable_decorators, { kind: "field", name: "isAvailable", static: false, private: false, access: { has: function (obj) { return "isAvailable" in obj; }, get: function (obj) { return obj.isAvailable; }, set: function (obj, value) { obj.isAvailable = value; } }, metadata: _metadata }, _isAvailable_initializers, _isAvailable_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, null, _user_decorators, { kind: "field", name: "user", static: false, private: false, access: { has: function (obj) { return "user" in obj; }, get: function (obj) { return obj.user; }, set: function (obj, value) { obj.user = value; } }, metadata: _metadata }, _user_initializers, _user_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TalentProfile = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TalentProfile = _classThis;
}();
exports.TalentProfile = TalentProfile;
