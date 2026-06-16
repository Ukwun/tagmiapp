"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const livekit_models_1 = require("../../proto/livekit_models");
const LocalVideoTrack_1 = require("./LocalVideoTrack");
describe('videoLayersFromEncodings', () => {
    it('returns single layer for no encoding', () => {
        const layers = LocalVideoTrack_1.videoLayersFromEncodings(640, 360);
        expect(layers).toHaveLength(1);
        expect(layers[0].quality).toBe(livekit_models_1.VideoQuality.HIGH);
        expect(layers[0].width).toBe(640);
        expect(layers[0].height).toBe(360);
    });
    it('returns single layer for explicit encoding', () => {
        const layers = LocalVideoTrack_1.videoLayersFromEncodings(640, 360, [{
                maxBitrate: 200000,
            }]);
        expect(layers).toHaveLength(1);
        expect(layers[0].quality).toBe(livekit_models_1.VideoQuality.HIGH);
        expect(layers[0].bitrate).toBe(200000);
    });
    it('returns three layers for simulcast', () => {
        const layers = LocalVideoTrack_1.videoLayersFromEncodings(1280, 720, [
            {
                scaleResolutionDownBy: 4,
                rid: 'q',
                maxBitrate: 125000,
            },
            {
                scaleResolutionDownBy: 2,
                rid: 'h',
                maxBitrate: 500000,
            },
            {
                rid: 'f',
                maxBitrate: 1200000,
            },
        ]);
        expect(layers).toHaveLength(3);
        expect(layers[0].quality).toBe(livekit_models_1.VideoQuality.LOW);
        expect(layers[0].width).toBe(320);
        expect(layers[2].quality).toBe(livekit_models_1.VideoQuality.HIGH);
        expect(layers[2].height).toBe(720);
    });
    it('handles portrait', () => {
        const layers = LocalVideoTrack_1.videoLayersFromEncodings(720, 1280, [
            {
                scaleResolutionDownBy: 4,
                rid: 'q',
                maxBitrate: 125000,
            },
            {
                scaleResolutionDownBy: 2,
                rid: 'h',
                maxBitrate: 500000,
            },
            {
                rid: 'f',
                maxBitrate: 1200000,
            },
        ]);
        expect(layers).toHaveLength(3);
        expect(layers[0].quality).toBe(livekit_models_1.VideoQuality.LOW);
        expect(layers[0].height).toBe(320);
        expect(layers[2].quality).toBe(livekit_models_1.VideoQuality.HIGH);
        expect(layers[2].width).toBe(720);
    });
});
//# sourceMappingURL=LocalVideoTrack.test.js.map