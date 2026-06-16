import {
  Controller,
  Post,
  Patch,
  Get,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
} from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { DraftService } from "./draft.service"

@ApiTags("Drafts")
@Controller("content/drafts")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DraftController {
  constructor(private draftService: DraftService) {}

  @Post()
  @ApiOperation({ summary: "Create a draft (metadata only, no file uploads)" })
  @ApiResponse({ status: 201, description: "Draft created" })
  async createDraft(@Request() req, @Body() dto: any) {
    return this.draftService.createDraft(req.user.id, dto)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a draft (metadata only)" })
  @ApiResponse({ status: 200, description: "Draft updated" })
  async updateDraft(@Param("id") id: string, @Request() req, @Body() dto: any) {
    return this.draftService.updateDraft(id, req.user.id, dto)
  }

  @Get()
  @ApiOperation({ summary: "List user drafts" })
  @ApiResponse({ status: 200, description: "Drafts listed" })
  async listDrafts(@Request() req) {
    return this.draftService.listDrafts(req.user.id)
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a draft" })
  @ApiResponse({ status: 200, description: "Draft retrieved" })
  async getDraft(@Param("id") id: string, @Request() req) {
    return this.draftService.getDraft(id, req.user.id)
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a draft" })
  @ApiResponse({ status: 200, description: "Draft deleted" })
  async deleteDraft(@Param("id") id: string, @Request() req) {
    await this.draftService.deleteDraft(id, req.user.id)
    return { message: "Draft deleted" }
  }
}
