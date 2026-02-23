import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async selectLawyer(listingId: string, clientUserId: string, lawyerUserId: string, ndaRequired: boolean) {
    const listing = await this.prisma.caseListing.findUnique({ where: { listing_id: listingId } });
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    if (listing.owner_user_id !== clientUserId) {
      throw new ForbiddenException();
    }

    return this.prisma.match.create({
      data: {
        listing_id: listingId,
        client_user_id: clientUserId,
        lawyer_user_id: lawyerUserId,
        nda_required: ndaRequired,
        status: ndaRequired ? 'NDA_PENDING' : 'ACTIVE'
      }
    });
  }

  async acceptNda(matchId: string, userId: string) {
    const match = await this.prisma.match.findUnique({ where: { match_id: matchId } });
    if (!match) {
      throw new NotFoundException('Match not found');
    }
    if (match.client_user_id !== userId && match.lawyer_user_id !== userId) {
      throw new ForbiddenException();
    }
    return this.prisma.match.update({
      where: { match_id: matchId },
      data: { nda_accepted_at: new Date(), status: 'NDA_ACCEPTED' }
    });
  }
}
