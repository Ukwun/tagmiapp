import { MusicService } from "./music.service";
export declare class MusicController {
    private readonly musicService;
    constructor(musicService: MusicService);
    search(query: string, limit?: string): Promise<import("./music.service").MusicTrack[]>;
    trending(limit?: string): Promise<import("./music.service").MusicTrack[]>;
}
