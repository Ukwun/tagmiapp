/**
 * MediaAnalysisService
 *
 * Analyzes video, image, and audio content using Claude Vision API (Anthropic).
 * Replaces the old local model approach (Whisper + ViT-GPT2) which produced
 * inaccurate descriptions and categories.
 *
 * For images: sends the image to Claude Haiku vision → gets description + categories.
 * For videos: extracts 3 key frames with FFmpeg → sends all frames to Claude → description + categories.
 * For audio: extracts audio, sends as context to Claude text → description + categories.
 *
 * A single Claude call returns both the description AND categories, which is
 * faster and more accurate than the old two-step approach (describe → then categorize separately).
 *
 * Results are stored on the Content entity (transcription, aiDescription, categories columns)
 * and feed into the embedding pipeline.
 *
 * This service does NOT update embeddings — that is EmbeddingsService's job.
 */
import { Injectable, Logger } from "@nestjs/common"
import Anthropic from "@anthropic-ai/sdk"
import * as path from "path"
import * as os from "os"
import * as fs from "fs/promises"
import { execFile } from "child_process"
import { promisify } from "util"
import { TALENT_CATEGORIES } from "../../common/constants/categories.constant"

const execFileAsync = promisify(execFile)

/** Results from analyzing a piece of media content */
export interface MediaAnalysisResult {
  transcription: string | null
  aiDescription: string | null
  categories: { category: string; confidence: number }[] | null
}

@Injectable()
export class MediaAnalysisService {
  private readonly logger = new Logger(MediaAnalysisService.name)
  private client: Anthropic | null = null

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (apiKey) {
      this.client = new Anthropic({ apiKey })
      this.logger.log(`Anthropic client initialized for media analysis (key: ${apiKey.substring(0, 20)}...)`)
    } else {
      this.logger.warn("ANTHROPIC_API_KEY not set — media analysis will be disabled")
    }
  }

  /**
   * Analyze a piece of content based on its type.
   * Returns aiDescription and categories from Claude Vision.
   * Never throws — returns nulls on failure so callers can proceed gracefully.
   */
  async analyzeContent(
    contentType: "video" | "image" | "audio" | "text",
    mediaUrl: string | null,
    caption?: string | null,
  ): Promise<MediaAnalysisResult> {
    if (!mediaUrl || contentType === "text") {
      return { transcription: null, aiDescription: null, categories: null }
    }

    if (!this.client) {
      this.logger.warn("Anthropic client not available — skipping analysis")
      return { transcription: null, aiDescription: null, categories: null }
    }

    try {
      switch (contentType) {
        case "video":
          return this.analyzeVideo(mediaUrl, caption)
        case "image":
          return this.analyzeImage(mediaUrl, caption)
        case "audio":
          return this.analyzeAudioContent(mediaUrl, caption)
        default:
          return { transcription: null, aiDescription: null, categories: null }
      }
    } catch (error) {
      this.logger.warn(`Media analysis failed for ${contentType}: ${(error as any).message}`)
      return { transcription: null, aiDescription: null, categories: null }
    }
  }

  /**
   * Analyze a piece of content from a local file path (instead of downloading from URL).
   * Used during upload when we already have the file in memory — avoids CDN download.
   * Returns aiDescription and categories from Claude Vision.
   * Never throws — returns nulls on failure so callers can proceed gracefully.
   */
  async analyzeContentFromFile(
    contentType: "video" | "image" | "audio" | "text",
    localFilePath: string,
    caption?: string | null,
  ): Promise<MediaAnalysisResult> {
    if (!localFilePath || contentType === "text") {
      return { transcription: null, aiDescription: null, categories: null }
    }

    if (!this.client) {
      this.logger.warn("Anthropic client not available — skipping analysis")
      return { transcription: null, aiDescription: null, categories: null }
    }

    try {
      switch (contentType) {
        case "video":
          return this.analyzeVideoFromFile(localFilePath, caption)
        case "image":
          return this.analyzeImageFromFile(localFilePath, caption)
        case "audio":
          return this.analyzeAudioContent("file://" + localFilePath, caption)
        default:
          return { transcription: null, aiDescription: null, categories: null }
      }
    } catch (error) {
      this.logger.warn(`Media analysis from file failed for ${contentType}: ${(error as any).message}`)
      return { transcription: null, aiDescription: null, categories: null }
    }
  }

  /**
   * Analyze an image: download, convert to base64, send to Claude Vision.
   * Claude sees the actual image and provides an accurate description
   * plus relevant content categories in a single API call.
   */
  private async analyzeImage(mediaUrl: string, caption?: string | null): Promise<MediaAnalysisResult> {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "media-analysis-"))

    try {
      const ext = this.getImageExtension(mediaUrl)
      const imagePath = path.join(tmpDir, `input.${ext}`)
      await this.downloadFile(mediaUrl, imagePath)

      const imageBase64 = await this.fileToBase64(imagePath)
      // Detect actual media type from file header, not URL extension
      const mediaType = await this.detectImageType(imagePath)

      const result = await this.callClaudeVision([{ base64: imageBase64, mediaType }], caption)
      return { transcription: null, ...result }
    } finally {
      await this.cleanupDir(tmpDir)
    }
  }

  /**
   * Analyze an image from a local file (no download needed).
   * Used during upload when we already have the file.
   */
  private async analyzeImageFromFile(imagePath: string, caption?: string | null): Promise<MediaAnalysisResult> {
    const imageBase64 = await this.fileToBase64(imagePath)
    const mediaType = await this.detectImageType(imagePath)
    const result = await this.callClaudeVision([{ base64: imageBase64, mediaType }], caption)
    return { transcription: null, ...result }
  }

  /**
   * Analyze a video: extract key frames + audio, send to Claude Vision.
   * Extracts 3 frames at 25%, 50%, 75% through the video so Claude
   * can understand the visual content across the video's duration.
   * Also extracts and transcribes audio for complete context.
   */
  private async analyzeVideo(mediaUrl: string, caption?: string | null): Promise<MediaAnalysisResult> {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "media-analysis-"))

    try {
      const videoPath = path.join(tmpDir, "input.mp4")
      await this.downloadFile(mediaUrl, videoPath)

      // Extract audio and transcribe in parallel with frame extraction
      const [framePaths, transcription] = await Promise.all([
        this.extractVideoFrames(videoPath, tmpDir),
        this.extractAndTranscribeAudio(videoPath, tmpDir),
      ])

      if (framePaths.length === 0) {
        this.logger.warn("No frames extracted from video — skipping analysis")
        return { transcription, aiDescription: null, categories: null }
      }

      // Convert frames to base64 for the API
      const images: { base64: string; mediaType: string }[] = []
      for (const framePath of framePaths) {
        const base64 = await this.fileToBase64(framePath)
        images.push({ base64, mediaType: "image/jpeg" })
      }

      // Pass transcription to Claude along with visual frames
      const result = await this.callClaudeVision(images, caption, true, transcription)
      return { transcription, ...result }
    } finally {
      await this.cleanupDir(tmpDir)
    }
  }

  /**
   * Analyze a video from a local file (no download needed).
   * Used during upload when we already have the file.
   */
  private async analyzeVideoFromFile(videoPath: string, caption?: string | null): Promise<MediaAnalysisResult> {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "media-analysis-"))

    try {
      // Extract audio and transcribe in parallel with frame extraction
      const [framePaths, transcription] = await Promise.all([
        this.extractVideoFrames(videoPath, tmpDir),
        this.extractAndTranscribeAudio(videoPath, tmpDir),
      ])

      if (framePaths.length === 0) {
        this.logger.warn("No frames extracted from video — skipping analysis")
        return { transcription, aiDescription: null, categories: null }
      }

      // Convert frames to base64 for the API
      const images: { base64: string; mediaType: string }[] = []
      for (const framePath of framePaths) {
        const base64 = await this.fileToBase64(framePath)
        images.push({ base64, mediaType: "image/jpeg" })
      }

      // Pass transcription to Claude along with visual frames
      const result = await this.callClaudeVision(images, caption, true, transcription)
      return { transcription, ...result }
    } finally {
      await this.cleanupDir(tmpDir)
    }
  }

  /**
   * Analyze audio content: we can't send audio to Claude Vision directly,
   * so we use Claude text with whatever caption/context is available.
   * If there's no caption, we skip — audio-only posts without captions
   * will rely on user-provided hashtags for categorization.
   */
  private async analyzeAudioContent(
    mediaUrl: string,
    caption?: string | null,
  ): Promise<MediaAnalysisResult> {
    if (!caption) {
      return { transcription: null, aiDescription: null, categories: null }
    }

    // Use Claude text to categorize based on caption
    try {
      const result = await this.callClaudeText(caption)
      return { transcription: null, ...result }
    } catch (error) {
      this.logger.warn(`Audio categorization failed: ${(error as any).message}`)
      return { transcription: null, aiDescription: null, categories: null }
    }
  }

  /**
   * Send one or more images to Claude Vision and get back a description + categories.
   * Uses claude-haiku for speed and cost efficiency (~$0.001 per image).
   *
   * The prompt asks Claude to:
   * 1. Describe what's in the image(s) in one sentence
   * 2. Assign up to 3 categories from our predefined list with confidence scores
   *
   * Returns structured JSON parsed from Claude's response.
   */
  private async callClaudeVision(
    images: { base64: string; mediaType: string }[],
    caption?: string | null,
    isVideo = false,
    transcription?: string | null,
  ): Promise<{ aiDescription: string | null; categories: { category: string; confidence: number }[] | null }> {
    const contentBlocks: Anthropic.Messages.ContentBlockParam[] = []

    // Add images
    for (const img of images) {
      contentBlocks.push({
        type: "image",
        source: {
          type: "base64",
          media_type: img.mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
          data: img.base64,
        },
      })
    }

    // Build the prompt with audio context if available
    const mediaWord = isVideo ? "video frames" : "image"
    const captionContext = caption ? `\nThe creator's caption is: "${caption}"` : ""
    const audioContext = transcription ? `\nAudio transcription: "${transcription}"` : ""

    contentBlocks.push({
      type: "text",
      text: `Analyze this ${mediaWord} from a social media platform for creative talent (musicians, comedians, dancers, artists, etc).${captionContext}${audioContext}

Respond with ONLY valid JSON in this exact format, no other text:
{
  "description": "A clear one-sentence description of what is shown",
  "categories": [
    {"category": "CategoryName", "confidence": 0.85},
    {"category": "CategoryName", "confidence": 0.60}
  ]
}

Rules:
- description: One natural sentence describing the content. Be specific about what you see.
- categories: Pick 1-3 most relevant from ONLY this list: ${TALENT_CATEGORIES.join(", ")}
- confidence: 0.0 to 1.0 based on how clearly the content matches that category
- If nothing matches well, return an empty categories array
- Do NOT invent categories outside the list`,
    })

    const response = await this.client!.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{ role: "user", content: contentBlocks }],
    })

    return this.parseClaudeResponse(response)
  }

  /**
   * Use Claude text (no vision) to categorize content based on text alone.
   * Used for audio content where we only have a caption.
   */
  private async callClaudeText(
    text: string,
  ): Promise<{ aiDescription: string | null; categories: { category: string; confidence: number }[] | null }> {
    const response = await this.client!.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `Categorize this social media post caption from a creative talent platform:

"${text}"

Respond with ONLY valid JSON in this exact format:
{
  "description": "A brief description of what this post is about",
  "categories": [
    {"category": "CategoryName", "confidence": 0.85}
  ]
}

Pick 1-3 categories from ONLY this list: ${TALENT_CATEGORIES.join(", ")}
confidence: 0.0 to 1.0. If nothing matches, return empty categories array.`,
        },
      ],
    })

    return this.parseClaudeResponse(response)
  }

  /**
   * Parse Claude's JSON response into our structured format.
   * Handles cases where Claude wraps JSON in markdown code blocks.
   */
  private parseClaudeResponse(
    response: Anthropic.Messages.Message,
  ): { aiDescription: string | null; categories: { category: string; confidence: number }[] | null } {
    try {
      const text = response.content[0]?.type === "text" ? response.content[0].text : null
      if (!text) return { aiDescription: null, categories: null }

      // Strip markdown code block wrapper if present
      const jsonStr = text.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim()
      const parsed = JSON.parse(jsonStr)

      const aiDescription = parsed.description || null

      // Validate categories against our allowed list
      const categories = Array.isArray(parsed.categories)
        ? parsed.categories
            .filter((c: any) => TALENT_CATEGORIES.includes(c.category) && typeof c.confidence === "number")
            .map((c: any) => ({
              category: c.category,
              confidence: Math.min(1, Math.max(0, c.confidence)),
            }))
        : null

      return { aiDescription, categories: categories?.length ? categories : null }
    } catch (error) {
      this.logger.warn(`Failed to parse Claude response: ${(error as any).message}`)
      return { aiDescription: null, categories: null }
    }
  }

  /**
   * Extract 3 frames from a video at 25%, 50%, 75% through its duration.
   * Frames are resized to 768px wide for Claude Vision (good balance of
   * detail vs token cost).
   */
  private async extractVideoFrames(videoPath: string, tmpDir: string): Promise<string[]> {
    try {
      const duration = await this.getVideoDuration(videoPath)
      if (duration <= 0) return []

      const timestamps = [
        Math.max(0.5, duration * 0.25),
        duration * 0.5,
        Math.min(duration - 0.5, duration * 0.75),
      ]

      const framePaths: string[] = []
      for (let i = 0; i < timestamps.length; i++) {
        const framePath = path.join(tmpDir, `frame_${i}.jpg`)
        try {
          await execFileAsync("/opt/homebrew/bin/ffmpeg", [
            "-ss", String(timestamps[i]),
            "-i", videoPath,
            "-vframes", "1",
            "-vf", "scale=768:-2",
            "-q:v", "3",
            "-y", framePath,
          ], { timeout: 15000 })

          const stat = await fs.stat(framePath).catch(() => null)
          if (stat && stat.size > 0) {
            framePaths.push(framePath)
          }
        } catch {
          // Skip this frame if extraction fails
        }
      }

      return framePaths
    } catch (error) {
      this.logger.warn(`Frame extraction failed: ${(error as any).message}`)
      return []
    }
  }

  /** Get video duration in seconds using ffprobe. */
  private async getVideoDuration(videoPath: string): Promise<number> {
    try {
      const { stdout } = await execFileAsync("/opt/homebrew/bin/ffprobe", [
        "-v", "quiet",
        "-print_format", "json",
        "-show_format",
        videoPath,
      ], { timeout: 10000 })

      const info = JSON.parse(stdout)
      return parseFloat(info.format?.duration || "0")
    } catch {
      return 0
    }
  }

  /**
   * Extract audio from video and transcribe using local Whisper.
   * Returns transcription text or null if extraction/transcription fails.
   */
  private async extractAndTranscribeAudio(videoPath: string, tmpDir: string): Promise<string | null> {
    try {
      const audioPath = path.join(tmpDir, "audio.wav")

      // Extract audio as 16kHz mono WAV (Whisper's preferred format)
      await execFileAsync("/opt/homebrew/bin/ffmpeg", [
        "-i", videoPath,
        "-vn",                    // no video
        "-acodec", "pcm_s16le",   // 16-bit PCM
        "-ar", "16000",           // 16kHz sample rate
        "-ac", "1",               // mono
        "-y", audioPath,
      ], { timeout: 30000 })

      // Check if audio was extracted
      const stat = await fs.stat(audioPath).catch(() => null)
      if (!stat || stat.size === 0) {
        this.logger.warn("No audio extracted from video")
        return null
      }

      // Transcribe using local Whisper
      const { stdout } = await execFileAsync("/opt/homebrew/bin/whisper-cli", [
        "-m", "/Users/nwong/.whisper-models/ggml-base.bin",
        "-f", audioPath,
        "--output-txt",           // output as text
        "--no-timestamps",        // we don't need timestamps
        "--language", "auto",     // auto-detect language
      ], { timeout: 60000 })

      // Parse transcription from stdout
      const transcription = stdout.trim()
      return transcription.length > 0 ? transcription : null
    } catch (error) {
      this.logger.warn(`Audio transcription failed: ${(error as any).message}`)
      return null
    }
  }

  /**
   * Download a file from a URL to a local path.
   * 60-second timeout prevents hanging on slow CDN connections.
   */
  private async downloadFile(url: string, outputPath: string): Promise<void> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000)

    try {
      const response = await fetch(url, { signal: controller.signal })
      if (!response.ok) {
        throw new Error(`Failed to download ${url}: ${response.status}`)
      }

      const buffer = Buffer.from(await response.arrayBuffer())
      await fs.writeFile(outputPath, buffer)
    } finally {
      clearTimeout(timeout)
    }
  }

  /** Read a file and return its content as a base64 string. */
  private async fileToBase64(filePath: string): Promise<string> {
    const buffer = await fs.readFile(filePath)
    return buffer.toString("base64")
  }

  /** Determine image file extension from URL. */
  private getImageExtension(url: string): string {
    if (url.includes(".png")) return "png"
    if (url.includes(".webp")) return "webp"
    if (url.includes(".gif")) return "gif"
    return "jpg"
  }

  /** Map file extension to MIME type for the Claude API. */
  private getMediaType(ext: string): string {
    const types: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
    }
    return types[ext] || "image/jpeg"
  }

  /** Detect actual image type from file header bytes (magic numbers) */
  private async detectImageType(filePath: string): Promise<string> {
    const buffer = await fs.readFile(filePath)

    // Check magic numbers (file signature bytes)
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return "image/jpeg"
    }
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return "image/png"
    }
    if (buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
      return "image/webp"
    }
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      return "image/gif"
    }

    // Fallback to extension-based detection
    const ext = path.extname(filePath).toLowerCase().slice(1)
    return this.getMediaType(ext)
  }

  /** Remove a temp directory and all its contents. */
  private async cleanupDir(dirPath: string): Promise<void> {
    try {
      const files = await fs.readdir(dirPath)
      for (const file of files) {
        await fs.unlink(path.join(dirPath, file)).catch(() => {})
      }
      await fs.rmdir(dirPath).catch(() => {})
    } catch {
      // Ignore cleanup errors
    }
  }
}

