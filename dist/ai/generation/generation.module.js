"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const generation_service_1 = require("./generation.service");
const generation_controller_1 = require("./generation.controller");
const embeddings_module_1 = require("../embeddings/embeddings.module");
const content_entity_1 = require("../../content/entities/content.entity");
const content_embedding_entity_1 = require("../embeddings/content-embedding.entity");
let GenerationModule = class GenerationModule {
};
exports.GenerationModule = GenerationModule;
exports.GenerationModule = GenerationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([content_entity_1.Content, content_embedding_entity_1.ContentEmbedding]),
            embeddings_module_1.EmbeddingsModule,
        ],
        controllers: [generation_controller_1.GenerationController],
        providers: [generation_service_1.GenerationService],
        exports: [generation_service_1.GenerationService],
    })
], GenerationModule);
//# sourceMappingURL=generation.module.js.map