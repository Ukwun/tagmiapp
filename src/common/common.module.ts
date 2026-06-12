/**
 * CommonModule
 *
 * Exports all shared utilities, helpers, and services used across the backend.
 * Any module that needs user fetching, pagination, or other common patterns
 * imports this module to get access to the helpers.
 *
 * This module does NOT handle business logic.
 * It only provides reusable infrastructure utilities.
 *
 * Used by: All feature modules (auth, content, bookings, chat, etc.)
 */
import { Module, Global } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { User } from "../users/entities/user.entity"
import { Content } from "../content/entities/content.entity"
import { UserRepositoryHelper } from "./repositories/user-repository.helper"
import { ContentRepositoryHelper } from "./repositories/content-repository.helper"
import { CategoriesController } from "./categories.controller"

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Content]),
  ],
  controllers: [
    CategoriesController,
  ],
  providers: [
    UserRepositoryHelper,
    ContentRepositoryHelper,
  ],
  exports: [
    UserRepositoryHelper,
    ContentRepositoryHelper,
  ],
})
export class CommonModule {}
