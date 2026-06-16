"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const content_entity_1 = require("../content/entities/content.entity");
const user_repository_helper_1 = require("./repositories/user-repository.helper");
const content_repository_helper_1 = require("./repositories/content-repository.helper");
const categories_controller_1 = require("./categories.controller");
let CommonModule = class CommonModule {
};
exports.CommonModule = CommonModule;
exports.CommonModule = CommonModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, content_entity_1.Content]),
        ],
        controllers: [
            categories_controller_1.CategoriesController,
        ],
        providers: [
            user_repository_helper_1.UserRepositoryHelper,
            content_repository_helper_1.ContentRepositoryHelper,
        ],
        exports: [
            user_repository_helper_1.UserRepositoryHelper,
            content_repository_helper_1.ContentRepositoryHelper,
        ],
    })
], CommonModule);
//# sourceMappingURL=common.module.js.map