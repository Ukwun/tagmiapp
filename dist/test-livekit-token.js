"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const livestream_service_1 = require("./livestream/livestream.service");
const livestream_entity_1 = require("./livestream/livestream.entity");
const user_entity_1 = require("./users/entities/user.entity");
const typeorm_1 = require("@nestjs/typeorm");
const error_utils_1 = require("./common/utils/error.utils");
async function verifyToken() {
    console.log("🚀 Bootstrapping Tagmi Token Verifier...");
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const livestreamService = app.get(livestream_service_1.LivestreamService);
    const streamRepo = app.get((0, typeorm_1.getRepositoryToken)(livestream_entity_1.Livestream));
    const userRepo = app.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
    const stream = await streamRepo.findOne({ where: { status: 'live' } });
    const user = await userRepo.findOne({ where: { id: stream?.hostId } });
    if (!stream || !user) {
        console.error("❌ Error: No active live stream found in DB. Start a stream first.");
        await app.close();
        return;
    }
    console.log(`\nVerifying Token for Host: ${user.username}`);
    console.log(`Room Name: ${stream.roomName}`);
    try {
        const token = await livestreamService.getJoinToken(stream.id, user.id, user.username);
        const base64Payload = token.split('.')[1];
        const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
        console.log("\n--- TOKEN PAYLOAD ---");
        console.log(`Identity:  ${payload.sub}`);
        console.log(`Name:      ${payload.name}`);
        console.log(`Grants:    `, JSON.stringify(payload.video, null, 2));
        if (payload.video.room === stream.roomName && payload.video.roomJoin === true) {
            console.log("\n✅ SUCCESS: Token is valid and correctly bound to the room.");
        }
        else {
            console.log("\n❌ FAILED: Token claims do not match stream metadata.");
        }
    }
    catch (error) {
        console.error(`\n❌ CRITICAL FAILURE: ${(0, error_utils_1.getErrorMessage)(error)}`, (0, error_utils_1.getErrorStack)(error));
    }
    await app.close();
}
verifyToken();
//# sourceMappingURL=test-livekit-token.js.map