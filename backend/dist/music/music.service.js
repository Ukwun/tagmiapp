"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var MusicService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicService = void 0;
const common_1 = require("@nestjs/common");
const https = __importStar(require("https"));
let MusicService = MusicService_1 = class MusicService {
    constructor() {
        this.logger = new common_1.Logger(MusicService_1.name);
        this.DEEZER_BASE = "https://api.deezer.com";
    }
    mapTrack(track) {
        return {
            id: String(track.id),
            title: track.title || track.title_short || "",
            artist: track.artist?.name || "",
            album: track.album?.title || "",
            duration: track.duration || 0,
            previewUrl: track.preview || "",
            coverUrl: track.album?.cover_big || track.album?.cover_medium || "",
            coverSmall: track.album?.cover_small || track.album?.cover || "",
        };
    }
    httpsGetJson(url) {
        return new Promise((resolve, reject) => {
            const req = https.get(url, {
                headers: {
                    "User-Agent": "tagmi-server/1.0",
                    Accept: "application/json",
                },
                timeout: 10000,
            }, (res) => {
                if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
                    reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                    res.resume();
                    return;
                }
                let body = "";
                res.setEncoding("utf8");
                res.on("data", (chunk) => (body += chunk));
                res.on("end", () => {
                    try {
                        resolve(JSON.parse(body));
                    }
                    catch (e) {
                        reject(new Error(`Invalid JSON: ${e.message}`));
                    }
                });
            });
            req.on("timeout", () => {
                req.destroy(new Error("Request timeout"));
            });
            req.on("error", reject);
        });
    }
    async deezerFetch(path) {
        const url = `${this.DEEZER_BASE}${path}`;
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000);
            try {
                const res = await fetch(url, {
                    signal: controller.signal,
                    headers: {
                        "User-Agent": "tagmi-server/1.0",
                        Accept: "application/json",
                    },
                });
                if (!res.ok)
                    throw new Error(`Deezer API ${res.status}: ${res.statusText}`);
                return await res.json();
            }
            finally {
                clearTimeout(timeout);
            }
        }
        catch (fetchErr) {
            const cause = fetchErr?.cause;
            this.logger.warn(`fetch() failed for ${url}: ${fetchErr?.message}` +
                (cause ? ` | cause: ${cause?.code || ""} ${cause?.message || ""}` : "") +
                ` — falling back to https.get`);
            return this.httpsGetJson(url);
        }
    }
    async search(query, limit = 20) {
        if (!query.trim())
            return this.getTrending(limit);
        try {
            const data = await this.deezerFetch(`/search?q=${encodeURIComponent(query)}&limit=${Math.min(limit, 50)}`);
            return (data.data || [])
                .filter((t) => t.preview)
                .map((t) => this.mapTrack(t));
        }
        catch (err) {
            this.logger.error(`Music search failed: ${err?.message}` +
                (err?.cause ? ` | cause: ${err.cause?.code || ""} ${err.cause?.message || ""}` : ""));
            return [];
        }
    }
    async getTrending(limit = 20) {
        try {
            const data = await this.deezerFetch(`/chart/0/tracks?limit=${Math.min(limit, 50)}`);
            return (data.data || [])
                .filter((t) => t.preview)
                .map((t) => this.mapTrack(t));
        }
        catch (err) {
            this.logger.error(`Trending music fetch failed: ${err?.message}` +
                (err?.cause ? ` | cause: ${err.cause?.code || ""} ${err.cause?.message || ""}` : ""));
            return [];
        }
    }
};
exports.MusicService = MusicService;
exports.MusicService = MusicService = MusicService_1 = __decorate([
    (0, common_1.Injectable)()
], MusicService);
//# sourceMappingURL=music.service.js.map