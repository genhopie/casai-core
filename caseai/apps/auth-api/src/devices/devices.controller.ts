import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RegisterDeviceDto } from './dto';
import { DevicesService } from './devices.service';

@Controller('/devices')
@UseGuards(JwtAuthGuard)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post('/register')
  register(@Req() req: { user: { userId: string } }, @Body() dto: RegisterDeviceDto) {
    return this.devicesService.register(req.user.userId, dto.deviceIdHash);
  }
}
