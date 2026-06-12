"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const embeddings_service_1 = require("./embeddings.service");
const content_embedding_entity_1 = require("./content-embedding.entity");
const user_embedding_entity_1 = require("./user-embedding.entity");
const content_entity_1 = require("../../content/entities/content.entity");
const user_entity_1 = require("../../users/entities/user.entity");
let EmbeddingsModule = class EmbeddingsModule {
};
exports.EmbeddingsModule = EmbeddingsModule;
exports.EmbeddingsModule = EmbeddingsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([content_embedding_entity_1.ContentEmbedding, user_embedding_entity_1.UserEmbedding, content_entity_1.Content, user_entity_1.User])],
        providers: [embeddings_service_1.EmbeddingsService],
        exports: [embeddings_service_1.EmbeddingsService],
    })
], EmbeddingsModule);
//# sourceMappingURL=embeddings.module.js.map