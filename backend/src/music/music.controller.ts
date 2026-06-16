import { Controller, Get, Query, UseGuards } from "@nestjs/common"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { MusicService } from "./music.service"

@Controller("music")
@UseGuards(JwtAuthGuard)
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  /** Search tracks by query string */
  @Get("search")
  async search(
    @Query("q") query: string,
    @Query("limit") limit?: string,
  ) {
    return this.musicService.search(query || "", parseInt(limit || "20", 10))
  }

  /** Get currently trending/popular tracks */
  @Get("trending")
  async trending(@Query("limit") limit?: string) {
    return this.musicService.getTrending(parseInt(limit || "20", 10))
  }
}
