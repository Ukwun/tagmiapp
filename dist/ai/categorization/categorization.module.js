"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategorizationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const categorization_service_1 = require("./categorization.service");
const categorization_controller_1 = require("./categorization.controller");
const embeddings_module_1 = require("../embeddings/embeddings.module");
const content_entity_1 = require("../../content/entities/content.entity");
let CategorizationModule = class CategorizationModule {
};
exports.CategorizationModule = CategorizationModule;
exports.CategorizationModule = CategorizationModule = __decorate([
    (0, common_1.Module)({
        imports: [embeddings_module_1.EmbeddingsModule, typeorm_1.TypeOrmModule.forFeature([content_entity_1.Content])],
        controllers: [categorization_controller_1.CategorizationController],
        providers: [categorization_service_1.CategorizationService],
        exports: [categorization_service_1.CategorizationService],
    })
], CategorizationModule);
//# sourceMappingURL=categorization.module.js.map