"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const options_1 = require("./options");
const utils_1 = require("./utils");
describe('mergeDefaultOptions', () => {
    const audioDefaults = {
        autoGainControl: true,
        channelCount: 2,
    };
    const videoDefaults = {
        deviceId: 'video123',
        resolution: options_1.VideoPresets.fhd.resolution,
    };
    it('does not enable undefined options', () => {
        const opts = utils_1.mergeDefaultOptions(undefined, audioDefaults, videoDefaults);
        expect(opts.audio).toEqual(undefined);
        expect(opts.video).toEqual(undefined);
    });
    it('does not enable explicitly disabled', () => {
        const opts = utils_1.mergeDefaultOptions({
            video: false,
        });
        expect(opts.audio).toEqual(undefined);
        expect(opts.video).toEqual(false);
    });
    it('accepts true for options', () => {
        const opts = utils_1.mergeDefaultOptions({
            audio: true,
        }, audioDefaults, videoDefaults);
        expect(opts.audio).toEqual(audioDefaults);
        expect(opts.video).toEqual(undefined);
    });
    it('enables overriding specific fields', () => {
        const opts = utils_1.mergeDefaultOptions({
            audio: { channelCount: 1 },
        }, audioDefaults, videoDefaults);
        const audioOpts = opts.audio;
        expect(audioOpts.channelCount).toEqual(1);
        expect(audioOpts.autoGainControl).toEqual(true);
    });
    it('does not override explicit false', () => {
        const opts = utils_1.mergeDefaultOptions({
            audio: { autoGainControl: false },
        }, audioDefaults, videoDefaults);
        const audioOpts = opts.audio;
        expect(audioOpts.autoGainControl).toEqual(false);
    });
});
describe('constraintsForOptions', () => {
    it('correctly enables audio bool', () => {
        const constraints = utils_1.constraintsForOptions({
            audio: true,
        });
        expect(constraints.audio).toEqual(true);
        expect(constraints.video).toEqual(false);
    });
    it('converts audio options correctly', () => {
        const constraints = utils_1.constraintsForOptions({
            audio: {
                noiseSuppression: true,
                echoCancellation: false,
            },
        });
        const audioOpts = constraints.audio;
        expect(Object.keys(audioOpts)).toEqual(['noiseSuppression', 'echoCancellation']);
        expect(audioOpts.noiseSuppression).toEqual(true);
        expect(audioOpts.echoCancellation).toEqual(false);
    });
    it('converts video options correctly', () => {
        const constraints = utils_1.constraintsForOptions({
            video: {
                resolution: options_1.VideoPresets.hd.resolution,
                facingMode: 'user',
                deviceId: 'video123',
            },
        });
        const videoOpts = constraints.video;
        expect(Object.keys(videoOpts)).toEqual(['width', 'height', 'frameRate', 'aspectRatio', 'facingMode', 'deviceId']);
        expect(videoOpts.width).toEqual(options_1.VideoPresets.hd.resolution.width);
        expect(videoOpts.height).toEqual(options_1.VideoPresets.hd.resolution.height);
        expect(videoOpts.frameRate).toEqual(options_1.VideoPresets.hd.resolution.frameRate);
        expect(videoOpts.aspectRatio).toEqual(options_1.VideoPresets.hd.resolution.aspectRatio);
    });
});
//# sourceMappingURL=utils.test.js.map