import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CreateListingDto, ListingFiltersDto, UpdateListingDto } from './dto';
import { ListingsService } from './listings.service';

@Controller('/listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: { user: { userId: string } }, @Body() dto: CreateListingDto) {
    return this.listingsService.create(req.user.userId, dto);
  }

  @Get()
  list(@Query() filters: ListingFiltersDto) {
    return this.listingsService.list(filters);
  }

  @Get('/:id')
  getOne(@Param('id') id: string) {
    return this.listingsService.getOne(id);
  }

  @Post('/:id/publish')
  @UseGuards(JwtAuthGuard)
  publish(@Param('id') id: string, @Req() req: { user: { userId: string } }) {
    return this.listingsService.publish(id, req.user.userId);
  }

  @Patch('/:id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Req() req: { user: { userId: string } },
    @Body() dto: UpdateListingDto
  ) {
    return this.listingsService.update(id, req.user.userId, dto);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req: { user: { userId: string } }) {
    return this.listingsService.delete(id, req.user.userId);
  }
}
