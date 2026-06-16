import { Controller, Post, Body } from "@nestjs/common"
import { ApiTags, ApiOperation } from "@nestjs/swagger"
import { GenerationService } from "./generation.service"

@ApiTags("AI - Generation")
@Controller("ai/generate")
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @Post("hashtags")
  @ApiOperation({ summary: "Suggest hashtags for a given caption" })
  async suggestHashtags(@Body() body: { caption: string; limit?: number }) {
    return this.generationService.suggestHashtags(body.caption, body.limit)
  }
}
