import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { S3Client, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { randomUUID } from "crypto"
import * as path from "path"
import * as fs from "fs/promises"
import { createReadStream } from "fs"
import * as os from "os"
import { execFile } from "child_process"
import { promisify } from "util"
import sharp from "sharp"

const execFileAsync = promisify(execFile)

export interface UploadResult {
  secure_url: string
  public_id: string
  resource_type: string
  format: string
  bytes: number
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name)
  private s3: S3Client
  private bucket: string
  private cdnBaseUrl: string
  private wasabiEndpoint: string

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.get<string>("WASABI_BUCKET") || "tagmi"
    this.cdnBaseUrl = this.configService.get<string>("BUNNY_CDN_URL") || ""
    this.wasabiEndpoint = this.configService.get<string>("WASABI_ENDPOINT") || "https://s3.wasabisys.com"

    this.s3 = new S3Client({
      endpoint: this.wasabiEndpoint,
      region: this.configService.get<string>("WASABI_REGION") || "us-east-1",
      credentials: {
        accessKeyId: this.configService.get<string>("WASABI_ACCESS_KEY") || "",
        secretAccessKey: this.configService.get<string>("WASABI_SECRET_KEY") || "",
      },
      forcePathStyle: true,
    })
  }

  private getContentType(file: Express.Multer.File): string {
    return file.mimetype || "application/octet-stream"
  }

  private generateKey(folder: string, file: Express.Multer.File): string {
    const ext = path.extname(file.originalname) || ""
    const id = randomUUID()
    return `${folder}/${id}${ext}`
  }

  private getUrl(key: string): string {
    // If Bunny CDN is configured, use it; otherwise direct Wasabi URL
    if (this.cdnBaseUrl) {
      return `${this.cdnBaseUrl.replace(/\/$/, "")}/${key}`
    }
    return `${this.wasabiEndpoint}/${this.bucket}/${key}`
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    })
    return getSignedUrl(this.s3, command, { expiresIn })
  }

  async uploadFile(file: Express.Multer.File, folder: string = "uploads"): Promise<UploadResult> {
    const key = this.generateKey(folder, file)

    // Stream from disk (diskStorage) or fall back to buffer (memoryStorage)
    const body = file.path ? createReadStream(file.path) : file.buffer

    const upload = new Upload({
      client: this.s3,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: this.getContentType(file),
        CacheControl: "public, max-age=31536000, immutable",
      },
      // 10MB parts, up to 4 concurrent uploads
      partSize: 10 * 1024 * 1024,
      leavePartsOnError: false,
    })

    await upload.done()

    // Clean up temp file from disk
    if (file.path) {
      fs.unlink(file.path).catch(() => {})
    }

    this.logger.log(`Uploaded ${key} (${file.size} bytes)`)

    return {
      secure_url: this.getUrl(key),
      public_id: key,
      resource_type: file.mimetype?.startsWith("video") ? "video" : file.mimetype?.startsWith("audio") ? "audio" : "image",
      format: path.extname(file.originalname).replace(".", ""),
      bytes: file.size,
    }
  }

  /**
   * Compress and optimise an image before uploading to CDN.
   *
   * - Caps resolution at 1920px on the longest side (retina-quality for
   *   any phone or laptop screen). An uncapped 4032x3024 iPhone photo
   *   weighs ~5MB; after this it's typically 200-400KB.
   * - Converts to WebP for ~30-50% smaller files than JPEG at equal quality.
   * - Strips EXIF metadata (GPS, camera model) for privacy.
   * - Falls back to the original file if sharp fails for any reason.
   */
  private async processImage(file: Express.Multer.File): Promise<Express.Multer.File> {
    try {
      const input = file.path
        ? await fs.readFile(file.path)
        : file.buffer

      const processed = await sharp(input)
        .rotate()                          // auto-rotate based on EXIF orientation
        .resize(1920, 1920, {
          fit: "inside",                   // keep aspect ratio, don't crop
          withoutEnlargement: true,        // never upscale small images
        })
        .webp({ quality: 82 })            // WebP at good quality — ~30-50% smaller than JPEG
        .toBuffer()

      const reduction = Math.round((1 - processed.length / file.size) * 100)
      this.logger.log(`Image compressed: ${file.originalname} (${file.size} -> ${processed.length} bytes, -${Math.max(reduction, 0)}%)`)

      return {
        ...file,
        buffer: processed,
        size: processed.length,
        originalname: file.originalname.replace(/\.[^.]+$/, ".webp"),
        mimetype: "image/webp",
        path: undefined as any,           // force buffer path so uploadFile uses it
      }
    } catch (err) {
      this.logger.warn(`Image processing failed, uploading original: ${(err as Error).message}`)
      return file
    }
  }

  /**
   * Upload an image with automatic compression and format conversion.
   * Images are resized to 1920px max, converted to WebP, and stripped
   * of EXIF data before hitting the CDN.
   */
  async uploadImage(file: Express.Multer.File, folder: string = "images"): Promise<UploadResult> {
    const processedFile = await this.processImage(file)
    return this.uploadFile(processedFile, folder)
  }

  /**
   * Get video dimensions and codec info via ffprobe.
   */
  private async getVideoInfo(inputPath: string): Promise<{ width: number; height: number; bitrate: number; codec: string }> {
    try {
      const { stdout } = await execFileAsync("ffprobe", [
        "-v", "quiet",
        "-print_format", "json",
        "-show_streams",
        "-show_format",
        inputPath,
      ], { timeout: 10000 })
      const info = JSON.parse(stdout)
      const videoStream = info.streams?.find((s: any) => s.codec_type === "video")
      return {
        width: parseInt(videoStream?.width || "0"),
        height: parseInt(videoStream?.height || "0"),
        bitrate: parseInt(info.format?.bit_rate || "0"),
        codec: videoStream?.codec_name || "unknown",
      }
    } catch {
      return { width: 0, height: 0, bitrate: 0, codec: "unknown" }
    }
  }

  /**
   * Process a video for optimal streaming:
   * 1. Re-encode to H.264 at capped resolution (720p) and bitrate (2.5Mbps) if needed
   * 2. Move moov atom to beginning (faststart) for progressive playback
   * 3. Use AAC audio at 128kbps
   *
   * Videos already at or below target quality use stream copy (no re-encoding).
   */
  private async processVideoFaststart(file: Express.Multer.File): Promise<Express.Multer.File> {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "faststart-"))
    const ext = path.extname(file.originalname) || ".mp4"
    const inputPath = path.join(tmpDir, `input${ext}`)
    const outputPath = path.join(tmpDir, `output.mp4`)

    try {
      if (file.path) {
        await fs.copyFile(file.path, inputPath)
      } else {
        await fs.writeFile(inputPath, file.buffer)
      }

      const info = await this.getVideoInfo(inputPath)
      const maxHeight = 720
      const maxBitrate = 2500000 // 2.5 Mbps
      const needsTranscode = info.height > maxHeight || info.bitrate > maxBitrate || info.codec !== "h264"

      const ffmpegArgs: string[] = ["-i", inputPath]

      if (needsTranscode) {
        // Re-encode: scale to 720p max, cap bitrate, use H.264 + AAC
        const scaleFilter = info.height > maxHeight
          ? ["-vf", `scale=-2:${maxHeight}`]
          : []
        ffmpegArgs.push(
          ...scaleFilter,
          "-c:v", "libx264",
          "-preset", "fast",
          "-crf", "23",
          "-maxrate", "2500k",
          "-bufsize", "5000k",
          "-profile:v", "high",
          "-level", "4.0",
          "-pix_fmt", "yuv420p",
          "-c:a", "aac",
          "-b:a", "128k",
          "-movflags", "+faststart",
          "-y", outputPath,
        )
        this.logger.log(`Transcoding ${file.originalname}: ${info.width}x${info.height} ${info.codec} ${Math.round(info.bitrate / 1000)}kbps -> 720p H.264`)
      } else {
        // Already optimized — just move moov atom
        ffmpegArgs.push(
          "-c", "copy",
          "-movflags", "+faststart",
          "-y", outputPath,
        )
        this.logger.log(`Faststart only (already optimized): ${file.originalname}`)
      }

      // Longer timeout for transcoding
      const timeout = needsTranscode ? 300000 : 120000
      await execFileAsync("ffmpeg", ffmpegArgs, { timeout })

      const buffer = await fs.readFile(outputPath)
      const processedFile: Express.Multer.File = {
        ...file,
        buffer,
        size: buffer.length,
        originalname: file.originalname.replace(/\.[^.]+$/, ".mp4"),
        mimetype: "video/mp4",
        path: outputPath,
      }

      const reduction = Math.round((1 - buffer.length / file.size) * 100)
      this.logger.log(`Video processed: ${file.originalname} (${file.size} -> ${buffer.length} bytes, ${reduction > 0 ? `-${reduction}` : `+${Math.abs(reduction)}`}%)`)
      return processedFile
    } catch (err) {
      this.logger.warn(`Video processing failed, uploading original: ${(err as Error).message}`);
      return file // Fall back to original file
    } finally {
      // Clean up input file (output cleaned up after upload)
      try { await fs.unlink(inputPath) } catch {}
    }
  }

  async uploadVideo(file: Express.Multer.File, folder: string = "videos"): Promise<UploadResult> {
    const processedFile = await this.processVideoFaststart(file)
    const result = await this.uploadFile(processedFile, folder)
    // Clean up faststart temp file
    if (processedFile !== file && processedFile.path) {
      fs.unlink(processedFile.path).catch(() => {})
    }
    return result
  }

  /**
   * Extract a thumbnail frame from a video at the 1-second mark (or first frame).
   * Uploads the thumbnail as a JPEG and returns the URL.
   */
  async generateVideoThumbnail(file: Express.Multer.File): Promise<string> {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "thumb-"))
    const inputPath = path.join(tmpDir, `input${path.extname(file.originalname) || ".mp4"}`)
    const outputPath = path.join(tmpDir, "thumb.jpg")

    try {
      if (file.path) {
        await fs.copyFile(file.path, inputPath)
      } else {
        await fs.writeFile(inputPath, file.buffer)
      }

      await execFileAsync("ffmpeg", [
        "-i", inputPath,
        "-ss", "1",           // 1 second in (avoids black frames)
        "-vframes", "1",      // single frame
        "-vf", "scale=640:-2", // 640px wide, maintain aspect ratio
        "-q:v", "3",          // good quality JPEG
        "-y", outputPath,
      ], { timeout: 15000 })

      const buffer = await fs.readFile(outputPath)
      const thumbFile: Express.Multer.File = {
        ...file,
        buffer,
        size: buffer.length,
        originalname: "thumbnail.jpg",
        mimetype: "image/jpeg",
        path: outputPath,
      }

      const result = await this.uploadFile(thumbFile, "thumbnails")
      return result.secure_url
    } catch (err) {
      this.logger.warn(`Thumbnail generation failed: ${(err as Error).message}`)
      return "" // Caller should fall back to mediaUrl
    } finally {
      try {
        const files = await fs.readdir(tmpDir)
        for (const f of files) await fs.unlink(path.join(tmpDir, f))
        await fs.rmdir(tmpDir)
      } catch {}
    }
  }

  /**
   * Split a video buffer into segments using stream copy (no re-encoding, very fast).
   */
  async splitVideo(
    file: Express.Multer.File,
    segments: { start: number; end: number }[],
  ): Promise<Express.Multer.File[]> {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "split-"))
    const ext = path.extname(file.originalname) || ".mp4"
    const inputPath = path.join(tmpDir, `input${ext}`)
    const results: Express.Multer.File[] = []

    try {
      // Copy from disk path or write from buffer
      if (file.path) {
        await fs.copyFile(file.path, inputPath)
      } else {
        await fs.writeFile(inputPath, file.buffer)
      }

      for (let i = 0; i < segments.length; i++) {
        const { start, end } = segments[i]
        const outputPath = path.join(tmpDir, `segment_${i}.mp4`)

        await execFileAsync("ffmpeg", [
          "-ss", String(start),
          "-i", inputPath,
          "-t", String(end - start),
          "-c", "copy",
          "-avoid_negative_ts", "make_zero",
          "-y", outputPath,
        ], { timeout: 30000 })

        const buffer = await fs.readFile(outputPath)
        const baseName = file.originalname.replace(/\.[^.]+$/, "")

        results.push({
          ...file,
          buffer,
          size: buffer.length,
          originalname: `${baseName}_part${i + 1}.mp4`,
          mimetype: "video/mp4",
        })
      }

      return results
    } finally {
      try {
        const files = await fs.readdir(tmpDir)
        for (const f of files) await fs.unlink(path.join(tmpDir, f))
        await fs.rmdir(tmpDir)
      } catch {}
    }
  }

  async deleteFile(publicId: string): Promise<any> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: publicId,
        }),
      )
      this.logger.log(`Deleted ${publicId}`)
      return { result: "ok" }
    } catch (error) {
      this.logger.error(`Failed to delete ${publicId}:`, error)
      return { result: "error" }
    }
  }
}
