/**
 * LiveKit Token Verification Test
 * Usage: npm run build && node dist/test-livekit-token.js
 */
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { LivestreamService } from "./livestream/livestream.service";
import { Repository } from "typeorm";
import { Livestream } from "./livestream/livestream.entity";
import { User } from "./users/entities/user.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { getErrorMessage, getErrorStack } from "./common/utils/error.utils";

async function verifyToken() {
  console.log("🚀 Bootstrapping Tagmi Token Verifier...");
  const app = await NestFactory.createApplicationContext(AppModule);

  const livestreamService = app.get(LivestreamService);
  const streamRepo = app.get<Repository<Livestream>>(getRepositoryToken(Livestream));
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));

  // 1. Grab a sample user and their active stream
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
    // 2. Generate the token
    const token = await livestreamService.getJoinToken(stream.id, user.id, user.username);
    
    // 3. Decode the token (it's a standard JWT)
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());

    console.log("\n--- TOKEN PAYLOAD ---");
    console.log(`Identity:  ${payload.sub}`); // User ID
    console.log(`Name:      ${payload.name}`);
    console.log(`Grants:    `, JSON.stringify(payload.video, null, 2));
    
    if (payload.video.room === stream.roomName && payload.video.roomJoin === true) {
      console.log("\n✅ SUCCESS: Token is valid and correctly bound to the room.");
    } else {
      console.log("\n❌ FAILED: Token claims do not match stream metadata.");
    }
  } catch (error: unknown) {
    console.error(`\n❌ CRITICAL FAILURE: ${getErrorMessage(error)}`, getErrorStack(error));
  }

  await app.close();
}

verifyToken();