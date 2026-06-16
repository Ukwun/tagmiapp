import { Injectable, NotFoundException, Logger } from "@nestjs/common"
import { Draft, DraftSlide } from "./entities/draft.entity"
import { DraftRepository } from "./repositories/draft.repository"

@Injectable()
export class DraftService {
  private readonly logger = new Logger(DraftService.name)

  constructor(
    private draftRepository: DraftRepository,
  ) {}

  async createDraft(userId: string, dto: any): Promise<Draft> {
    const slides = this.buildSlides(dto)

    const draft = this.draftRepository.create({
      userId,
      slides,
      hashtags: dto.hashtags || [],
      status: "saved",
    })

    return this.draftRepository.save(draft)
  }

  async updateDraft(draftId: string, userId: string, dto: any): Promise<Draft> {
    const draft = await this.draftRepository.findOne({ where: { id: draftId, userId } })
    if (!draft) throw new NotFoundException("Draft not found")

    draft.slides = this.buildSlides(dto)
    draft.hashtags = dto.hashtags || draft.hashtags
    draft.status = "saved"

    return this.draftRepository.save(draft)
  }

  async listDrafts(userId: string): Promise<Draft[]> {
    return this.draftRepository.find({
      where: { userId },
      order: { updatedAt: "DESC" },
    })
  }

  async getDraft(draftId: string, userId: string): Promise<Draft> {
    const draft = await this.draftRepository.findOne({ where: { id: draftId, userId } })
    if (!draft) throw new NotFoundException("Draft not found")
    return draft
  }

  async deleteDraft(draftId: string, userId: string): Promise<void> {
    const draft = await this.draftRepository.findOne({ where: { id: draftId, userId } })
    if (!draft) throw new NotFoundException("Draft not found")
    await this.draftRepository.remove(draft)
  }

  /**
   * Build slide metadata from the DTO — no file uploads, just text/type/style info.
   */
  private buildSlides(dto: any): DraftSlide[] {
    const slides: DraftSlide[] = Array.isArray(dto.slides) ? dto.slides : []

    if (slides.length > 0) {
      return slides.map((s, i) => ({
        type: s.type || "text",
        text: s.text,
        caption: s.caption,
        backgroundColor: s.backgroundColor,
        fontStyle: s.fontStyle,
        musicName: s.musicName,
        musicTrimStart: s.musicTrimStart,
        musicTrimEnd: s.musicTrimEnd,
        hasMediaFile: s.hasMediaFile || false,
        hasMusicFile: s.hasMusicFile || false,
        sortOrder: i,
      }))
    }

    return []
  }
}
