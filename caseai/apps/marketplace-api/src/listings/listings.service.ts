import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { assertNoPii } from '../common/pii';
import { CreateListingDto, ListingFiltersDto, UpdateListingDto } from './dto';

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerUserId: string, dto: CreateListingDto) {
    assertNoPii(dto.anonym_summary, 'anonym_summary');
    return this.prisma.caseListing.create({
      data: {
        owner_user_id: ownerUserId,
        jurisdiction: dto.jurisdiction,
        case_type: dto.case_type,
        languages: dto.languages,
        geo_scope_level: dto.geo_scope_level,
        deadline_date: new Date(dto.deadline_date),
        budget_min: dto.budget_min,
        budget_max: dto.budget_max,
        currency: dto.currency,
        doc_volume_count: dto.doc_volume_count,
        doc_volume_pages_est: dto.doc_volume_pages_est,
        anonym_summary: dto.anonym_summary
      }
    });
  }

  list(filters: ListingFiltersDto) {
    return this.prisma.caseListing.findMany({
      where: {
        ...(filters.jurisdiction ? { jurisdiction: filters.jurisdiction } : {}),
        ...(filters.case_type ? { case_type: filters.case_type } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        moderation_status: 'APPROVED'
      },
      orderBy: { created_at: 'desc' },
      take: filters.limit
    });
  }

  async publish(id: string, ownerUserId: string) {
    const listing = await this.prisma.caseListing.findUnique({ where: { listing_id: id } });
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    if (listing.owner_user_id !== ownerUserId) {
      throw new ForbiddenException();
    }
    return this.prisma.caseListing.update({
      where: { listing_id: id },
      data: { status: 'PUBLISHED', moderation_status: 'PENDING' }
    });
  }

  async getOne(id: string) {
    const listing = await this.prisma.caseListing.findUnique({ where: { listing_id: id } });
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    return listing;
  }

  async update(id: string, ownerUserId: string, dto: UpdateListingDto) {
    const listing = await this.prisma.caseListing.findUnique({ where: { listing_id: id } });
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    if (listing.owner_user_id !== ownerUserId) {
      throw new ForbiddenException();
    }
    if (dto.anonym_summary) {
      assertNoPii(dto.anonym_summary, 'anonym_summary');
    }

    return this.prisma.caseListing.update({
      where: { listing_id: id },
      data: {
        ...dto,
        ...(dto.deadline_date ? { deadline_date: new Date(dto.deadline_date) } : {})
      }
    });
  }

  async delete(id: string, ownerUserId: string) {
    const listing = await this.prisma.caseListing.findUnique({ where: { listing_id: id } });
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    if (listing.owner_user_id !== ownerUserId) {
      throw new ForbiddenException();
    }
    await this.prisma.caseListing.delete({ where: { listing_id: id } });
    return { deleted: true };
  }
}
