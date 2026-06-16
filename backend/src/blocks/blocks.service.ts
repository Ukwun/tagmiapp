import { Injectable, NotFoundException, ConflictException } from "@nestjs/common"
import { In } from "typeorm"
import { BlockRepository } from "./repositories/block.repository"
import { UserRepository } from "../users/repositories/user.repository"

@Injectable()
export class BlocksService {
  constructor(
    private blockRepository: BlockRepository,
    private userRepository: UserRepository,
  ) {}

  async blockUser(blockerId: string, blockedId: string): Promise<{ success: boolean; message: string }> {
    if (blockerId === blockedId) {
      throw new ConflictException("You cannot block yourself")
    }

    const [blocker, blocked] = await Promise.all([
      this.userRepository.findByIdOptional(blockerId),
      this.userRepository.findByIdOptional(blockedId),
    ])

    if (!blocker || !blocked) {
      throw new NotFoundException("User not found")
    }

    const existingBlock = await this.blockRepository.findOne({
      where: { blockerId, blockedId },
    })

    if (existingBlock) {
      throw new ConflictException("You have already blocked this user")
    }

    const block = this.blockRepository.create({ blockerId, blockedId })
    await this.blockRepository.save(block)

    return { success: true, message: "User blocked successfully" }
  }

  async unblockUser(blockerId: string, blockedId: string): Promise<{ success: boolean; message: string }> {
    const block = await this.blockRepository.findOne({
      where: { blockerId, blockedId },
    })

    if (!block) {
      throw new NotFoundException("Block not found")
    }

    await this.blockRepository.remove(block)

    return { success: true, message: "User unblocked successfully" }
  }

  async getBlockedUsers(userId: string, page = 1, limit = 20) {
    const [blocks, total] = await this.blockRepository.findAndCount({
      where: { blockerId: userId },
      relations: ["blocked"],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
    })

    const blockedUsers = blocks.map((block) => ({
      id: block.blocked.id,
      username: block.blocked.username,
      displayName: block.blocked.displayName,
      avatarUrl: block.blocked.avatarUrl,
      blockedAt: block.createdAt,
    }))

    return {
      data: blockedUsers,
      total,
      page,
      limit,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    }
  }

  async isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const block = await this.blockRepository.findOne({
      where: { blockerId, blockedId },
    })
    return !!block
  }

  async isBlockedByEither(userId1: string, userId2: string): Promise<boolean> {
    const blocks = await this.blockRepository.find({
      where: [
        { blockerId: userId1, blockedId: userId2 },
        { blockerId: userId2, blockedId: userId1 },
      ],
    })
    return blocks.length > 0
  }

  async getBlockedUserIds(userId: string): Promise<string[]> {
    const blocks = await this.blockRepository.find({
      where: { blockerId: userId },
      select: ["blockedId"],
    })
    return blocks.map((b) => b.blockedId)
  }

  async getUsersWhoBlockedMe(userId: string): Promise<string[]> {
    const blocks = await this.blockRepository.find({
      where: { blockedId: userId },
      select: ["blockerId"],
    })
    return blocks.map((b) => b.blockerId)
  }
}
