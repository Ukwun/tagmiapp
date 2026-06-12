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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTalentProfileDto = void 0;
var class_validator_1 = require("class-validator");
var swagger_1 = require("@nestjs/swagger");
var UpdateTalentProfileDto = function () {
    var _a;
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
    var _isAvailable_decorators;
    var _isAvailable_initializers = [];
    var _isAvailable_extraInitializers = [];
    return _a = /** @class */ (function () {
            function UpdateTalentProfileDto() {
                this.bio = __runInitializers(this, _bio_initializers, void 0);
                this.skills = (__runInitializers(this, _bio_extraInitializers), __runInitializers(this, _skills_initializers, void 0));
                this.categories = (__runInitializers(this, _skills_extraInitializers), __runInitializers(this, _categories_initializers, void 0));
                this.hourlyRate = (__runInitializers(this, _categories_extraInitializers), __runInitializers(this, _hourlyRate_initializers, void 0));
                this.location = (__runInitializers(this, _hourlyRate_extraInitializers), __runInitializers(this, _location_initializers, void 0));
                this.languages = (__runInitializers(this, _location_extraInitializers), __runInitializers(this, _languages_initializers, void 0));
                this.portfolioUrl = (__runInitializers(this, _languages_extraInitializers), __runInitializers(this, _portfolioUrl_initializers, void 0));
                this.socialLinks = (__runInitializers(this, _portfolioUrl_extraInitializers), __runInitializers(this, _socialLinks_initializers, void 0));
                this.isAvailable = (__runInitializers(this, _socialLinks_extraInitializers), __runInitializers(this, _isAvailable_initializers, void 0));
                __runInitializers(this, _isAvailable_extraInitializers);
            }
            return UpdateTalentProfileDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _bio_decorators = [(0, swagger_1.ApiProperty)({ example: "Experienced graphic designer with 5+ years in the industry", required: false }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _skills_decorators = [(0, swagger_1.ApiProperty)({ example: ["Graphic Design", "Logo Design", "Branding"], required: false }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true })];
            _categories_decorators = [(0, swagger_1.ApiProperty)({ example: ["Design", "Marketing"], required: false }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true })];
            _hourlyRate_decorators = [(0, swagger_1.ApiProperty)({ example: 50.0, required: false }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _location_decorators = [(0, swagger_1.ApiProperty)({ example: "New York, NY", required: false }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _languages_decorators = [(0, swagger_1.ApiProperty)({ example: ["English", "Spanish"], required: false }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsArray)(), (0, class_validator_1.IsString)({ each: true })];
            _portfolioUrl_decorators = [(0, swagger_1.ApiProperty)({ example: "https://myportfolio.com", required: false }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsUrl)()];
            _socialLinks_decorators = [(0, swagger_1.ApiProperty)({
                    example: { twitter: "https://twitter.com/username", instagram: "https://instagram.com/username" },
                    required: false,
                }), (0, class_validator_1.IsOptional)()];
            _isAvailable_decorators = [(0, swagger_1.ApiProperty)({ example: true, required: false }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsBoolean)()];
            __esDecorate(null, null, _bio_decorators, { kind: "field", name: "bio", static: false, private: false, access: { has: function (obj) { return "bio" in obj; }, get: function (obj) { return obj.bio; }, set: function (obj, value) { obj.bio = value; } }, metadata: _metadata }, _bio_initializers, _bio_extraInitializers);
            __esDecorate(null, null, _skills_decorators, { kind: "field", name: "skills", static: false, private: false, access: { has: function (obj) { return "skills" in obj; }, get: function (obj) { return obj.skills; }, set: function (obj, value) { obj.skills = value; } }, metadata: _metadata }, _skills_initializers, _skills_extraInitializers);
            __esDecorate(null, null, _categories_decorators, { kind: "field", name: "categories", static: false, private: false, access: { has: function (obj) { return "categories" in obj; }, get: function (obj) { return obj.categories; }, set: function (obj, value) { obj.categories = value; } }, metadata: _metadata }, _categories_initializers, _categories_extraInitializers);
            __esDecorate(null, null, _hourlyRate_decorators, { kind: "field", name: "hourlyRate", static: false, private: false, access: { has: function (obj) { return "hourlyRate" in obj; }, get: function (obj) { return obj.hourlyRate; }, set: function (obj, value) { obj.hourlyRate = value; } }, metadata: _metadata }, _hourlyRate_initializers, _hourlyRate_extraInitializers);
            __esDecorate(null, null, _location_decorators, { kind: "field", name: "location", static: false, private: false, access: { has: function (obj) { return "location" in obj; }, get: function (obj) { return obj.location; }, set: function (obj, value) { obj.location = value; } }, metadata: _metadata }, _location_initializers, _location_extraInitializers);
            __esDecorate(null, null, _languages_decorators, { kind: "field", name: "languages", static: false, private: false, access: { has: function (obj) { return "languages" in obj; }, get: function (obj) { return obj.languages; }, set: function (obj, value) { obj.languages = value; } }, metadata: _metadata }, _languages_initializers, _languages_extraInitializers);
            __esDecorate(null, null, _portfolioUrl_decorators, { kind: "field", name: "portfolioUrl", static: false, private: false, access: { has: function (obj) { return "portfolioUrl" in obj; }, get: function (obj) { return obj.portfolioUrl; }, set: function (obj, value) { obj.portfolioUrl = value; } }, metadata: _metadata }, _portfolioUrl_initializers, _portfolioUrl_extraInitializers);
            __esDecorate(null, null, _socialLinks_decorators, { kind: "field", name: "socialLinks", static: false, private: false, access: { has: function (obj) { return "socialLinks" in obj; }, get: function (obj) { return obj.socialLinks; }, set: function (obj, value) { obj.socialLinks = value; } }, metadata: _metadata }, _socialLinks_initializers, _socialLinks_extraInitializers);
            __esDecorate(null, null, _isAvailable_decorators, { kind: "field", name: "isAvailable", static: false, private: false, access: { has: function (obj) { return "isAvailable" in obj; }, get: function (obj) { return obj.isAvailable; }, set: function (obj, value) { obj.isAvailable = value; } }, metadata: _metadata }, _isAvailable_initializers, _isAvailable_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.UpdateTalentProfileDto = UpdateTalentProfileDto;
