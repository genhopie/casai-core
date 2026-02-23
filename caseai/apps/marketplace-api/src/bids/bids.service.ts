import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateBidDto } from './dto';

@Injectable()
export class BidsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(listingId: string, userId: string, dto: CreateBidDto) {
    const listing = await this.prisma.caseListing.findUnique({ where: { listing_id: listingId } });
    if (!listing || listing.status !== 'PUBLISHED' || listing.moderation_status !== 'APPROVED') {
      throw new NotFoundException('Listing unavailable');
    }
    return this.prisma.bid.create({
      data: {
        listing_id: listingId,
        lawyer_user_id: userId,
        pricing_type: dto.pricing_type,
        price_amount: dto.price_amount,
        currency: dto.currency,
        estimate_text: dto.estimate_text,
        conditions_text: dto.conditions_text
      }
    });
  }

  async withdraw(bidId: string, userId: string) {
    const bid = await this.prisma.bid.findUnique({ where: { bid_id: bidId } });
    if (!bid) {
      throw new NotFoundException('Bid not found');
    }
    if (bid.lawyer_user_id !== userId) {
      throw new ForbiddenException();
    }
    return this.prisma.bid.update({ where: { bid_id: bidId }, data: { status: 'WITHDRAWN' } });
  }
}
