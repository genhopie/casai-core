import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { IsEnum } from 'class-validator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { AdminService } from './admin.service';

enum ListingModeration {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

class ModerateListingDto {
  @IsEnum(ListingModeration)
  status!: ListingModeration;
}

@Controller('/admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('/listings/moderation-queue')
  queue() {
    return this.adminService.listingsQueue();
  }

  @Post('/listings/:id/moderate')
  moderate(
    @Param('id') listingId: string,
    @Body() dto: ModerateListingDto,
    @Req() req: { user: { userId: string } }
  ) {
    return this.adminService.setListingModeration(listingId, dto.status, req.user.userId);
  }

  @Get('/dashboard')
  dashboard() {
    return this.adminService.dashboard();
  }
}
