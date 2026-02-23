import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { MatchesService } from './matches.service';

class SelectLawyerDto {
  @IsString()
  @IsNotEmpty()
  lawyer_user_id!: string;

  @IsBoolean()
  nda_required!: boolean;
}

@Controller()
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post('/listings/:id/select-lawyer')
  selectLawyer(
    @Param('id') listingId: string,
    @Req() req: { user: { userId: string } },
    @Body() dto: SelectLawyerDto
  ) {
    return this.matchesService.selectLawyer(listingId, req.user.userId, dto.lawyer_user_id, dto.nda_required);
  }

  @Post('/matches/:id/nda/accept')
  acceptNda(@Param('id') matchId: string, @Req() req: { user: { userId: string } }) {
    return this.matchesService.acceptNda(matchId, req.user.userId);
  }
}
