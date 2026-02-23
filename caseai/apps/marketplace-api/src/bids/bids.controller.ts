import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CreateBidDto } from './dto';
import { BidsService } from './bids.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post('/listings/:id/bids')
  create(@Param('id') listingId: string, @Req() req: { user: { userId: string } }, @Body() dto: CreateBidDto) {
    return this.bidsService.create(listingId, req.user.userId, dto);
  }

  @Post('/bids/:id/withdraw')
  withdraw(@Param('id') bidId: string, @Req() req: { user: { userId: string } }) {
    return this.bidsService.withdraw(bidId, req.user.userId);
  }
}
