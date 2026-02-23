import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { LicenseService } from './license.service';

@Controller('/license')
@UseGuards(JwtAuthGuard)
export class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  @Post('/validate')
  validate(@Req() req: { user: { userId: string } }) {
    return this.licenseService.validate(req.user.userId);
  }
}
