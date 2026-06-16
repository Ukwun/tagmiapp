import { Controller, Get, Query } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger"
import { SearchService } from "./search.service"

@ApiTags("AI - Semantic Search")
@Controller("ai/search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: "Semantic search for content or talent" })
  @ApiQuery({ name: "q", required: true, type: String })
  @ApiQuery({ name: "type", required: false, enum: ["content", "talent"] })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async search(
    @Query("q") query: string,
    @Query("type") type?: "content" | "talent",
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    if (type === "talent") {
      return this.searchService.searchTalent(query, page, limit)
    }
    return this.searchService.searchContent(query, page, limit)
  }
}
