import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async createThread(userId: string, listingId?: string, matchId?: string) {
    if (!listingId && !matchId) {
      throw new NotFoundException('listing_id or match_id required');
    }

    const thread = await this.prisma.chatThread.create({
      data: {
        listing_id: listingId,
        match_id: matchId,
        participants: {
          create: [{ user_id: userId, role: 'CLIENT' }]
        }
      }
    });

    return thread;
  }

  async postMessage(threadId: string, senderUserId: string, ciphertext: string) {
    const participant = await this.prisma.chatParticipant.findFirst({
      where: { thread_id: threadId, user_id: senderUserId }
    });
    if (!participant) {
      throw new ForbiddenException();
    }
    return this.prisma.chatMessage.create({
      data: {
        thread_id: threadId,
        sender_user_id: senderUserId,
        ciphertext
      }
    });
  }

  async getMessages(threadId: string, userId: string) {
    const participant = await this.prisma.chatParticipant.findFirst({
      where: { thread_id: threadId, user_id: userId }
    });
    if (!participant) {
      throw new ForbiddenException();
    }
    return this.prisma.chatMessage.findMany({
      where: { thread_id: threadId },
      orderBy: { created_at: 'asc' },
      select: { message_id: true, sender_user_id: true, ciphertext: true, created_at: true }
    });
  }
}
