import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  listingsQueue() {
    return this.prisma.caseListing.findMany({
      where: { moderation_status: 'PENDING' },
      orderBy: { created_at: 'asc' },
      take: 200
    });
  }

  async setListingModeration(listingId: string, status: 'APPROVED' | 'REJECTED', actorUserId: string) {
    const updated = await this.prisma.caseListing.update({
      where: { listing_id: listingId },
      data: { moderation_status: status }
    });
    await this.prisma.adminAuditLog.create({
      data: {
        actor_user_id: actorUserId,
        action_type: status === 'APPROVED' ? 'APPROVE_LISTING' : 'REJECT_LISTING',
        target_type: 'CASE_LISTING',
        target_id: listingId,
        metadata: { moderation_status: status }
      }
    });
    return updated;
  }

  dashboard() {
    return Promise.all([
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.caseListing.count({ where: { status: 'PUBLISHED', moderation_status: 'APPROVED' } }),
      this.prisma.match.count({ where: { status: { in: ['ACTIVE', 'NDA_ACCEPTED'] } } })
    ]).then(([activeUsers, approvedListings, activeMatches]) => ({
      activeUsers,
      approvedListings,
      activeMatches
    }));
  }
}
