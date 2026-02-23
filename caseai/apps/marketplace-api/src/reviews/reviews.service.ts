import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { assertNoPii } from '../common/pii';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(matchId: string, reviewerUserId: string, scores: Record<string, number>, comment: string) {
    const match = await this.prisma.match.findUnique({ where: { match_id: matchId } });
    if (!match) {
      throw new NotFoundException('Match not found');
    }
    if (match.client_user_id !== reviewerUserId && match.lawyer_user_id !== reviewerUserId) {
      throw new ForbiddenException();
    }
    assertNoPii(comment, 'comment');
    const reviewedUserId = match.client_user_id === reviewerUserId ? match.lawyer_user_id : match.client_user_id;

    return this.prisma.review.create({
      data: {
        match_id: matchId,
        reviewer_user_id: reviewerUserId,
        reviewed_user_id: reviewedUserId,
        scores,
        comment
      }
    });
  }
}
