export interface MusicTrack {
    id: string;
    title: string;
    artist: string;
    album: string;
    duration: number;
    previewUrl: string;
    coverUrl: string;
    coverSmall: string;
}
export declare class MusicService {
    private readonly logger;
    private readonly DEEZER_BASE;
    private mapTrack;
    private httpsGetJson;
    private deezerFetch;
    search(query: string, limit?: number): Promise<MusicTrack[]>;
    getTrending(limit?: number): Promise<MusicTrack[]>;
}
