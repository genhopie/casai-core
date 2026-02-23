import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { ReviewsService } from './reviews.service';

class CreateReviewDto {
  @IsObject()
  scores!: Record<string, number>;

  @IsString()
  @IsNotEmpty()
  comment!: string;
}

@Controller()
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('/matches/:id/reviews')
  create(@Param('id') matchId: string, @Req() req: { user: { userId: string } }, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(matchId, req.user.userId, dto.scores, dto.comment);
  }
}
