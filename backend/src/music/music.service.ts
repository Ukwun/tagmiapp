import { Injectable, Logger } from "@nestjs/common"
import * as https from "https"

export interface MusicTrack {
  id: string
  title: string
  artist: string
  album: string
  duration: number // seconds
  previewUrl: string // 30-second preview MP3
  coverUrl: string // album cover image
  coverSmall: string // small cover
}

@Injectable()
export class MusicService {
  private readonly logger = new Logger(MusicService.name)
  private readonly DEEZER_BASE = "https://api.deezer.com"

  private mapTrack(track: any): MusicTrack {
    return {
      id: String(track.id),
      title: track.title || track.title_short || "",
      artist: track.artist?.name || "",
      album: track.album?.title || "",
      duration: track.duration || 0,
      previewUrl: track.preview || "",
      coverUrl: track.album?.cover_big || track.album?.cover_medium || "",
      coverSmall: track.album?.cover_small || track.album?.cover || "",
    }
  }

  /** Plain https.get fallback — bypasses undici to rule out Node fetch/undici issues */
  private httpsGetJson(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const req = https.get(
        url,
        {
          headers: {
            "User-Agent": "tagmi-server/1.0",
            Accept: "application/json",
          },
          timeout: 10000,
        },
        (res) => {
          if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
            reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`))
            res.resume()
            return
          }
          let body = ""
          res.setEncoding("utf8")
          res.on("data", (chunk) => (body += chunk))
          res.on("end", () => {
            try {
              resolve(JSON.parse(body))
            } catch (e) {
              reject(new Error(`Invalid JSON: ${e.message}`))
            }
          })
        },
      )
      req.on("timeout", () => {
        req.destroy(new Error("Request timeout"))
      })
      req.on("error", reject)
    })
  }

  private async deezerFetch(path: string): Promise<any> {
    const url = `${this.DEEZER_BASE}${path}`

    // Try global fetch first
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      try {
        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            "User-Agent": "tagmi-server/1.0",
            Accept: "application/json",
          },
        })
        if (!res.ok) throw new Error(`Deezer API ${res.status}: ${res.statusText}`)
        return await res.json()
      } finally {
        clearTimeout(timeout)
      }
    } catch (fetchErr: any) {
      const cause = fetchErr?.cause
      this.logger.warn(
        `fetch() failed for ${url}: ${fetchErr?.message}` +
          (cause ? ` | cause: ${cause?.code || ""} ${cause?.message || ""}` : "") +
          ` — falling back to https.get`,
      )
      // Fallback to https module
      return this.httpsGetJson(url)
    }
  }

  async search(query: string, limit: number = 20): Promise<MusicTrack[]> {
    if (!query.trim()) return this.getTrending(limit)

    try {
      const data = await this.deezerFetch(
        `/search?q=${encodeURIComponent(query)}&limit=${Math.min(limit, 50)}`,
      )
      return (data.data || [])
        .filter((t: any) => t.preview)
        .map((t: any) => this.mapTrack(t))
    } catch (err: any) {
      this.logger.error(
        `Music search failed: ${err?.message}` +
          (err?.cause ? ` | cause: ${err.cause?.code || ""} ${err.cause?.message || ""}` : ""),
      )
      return []
    }
  }

  async getTrending(limit: number = 20): Promise<MusicTrack[]> {
    try {
      const data = await this.deezerFetch(`/chart/0/tracks?limit=${Math.min(limit, 50)}`)
      return (data.data || [])
        .filter((t: any) => t.preview)
        .map((t: any) => this.mapTrack(t))
    } catch (err: any) {
      this.logger.error(
        `Trending music fetch failed: ${err?.message}` +
          (err?.cause ? ` | cause: ${err.cause?.code || ""} ${err.cause?.message || ""}` : ""),
      )
      return []
    }
  }
}
