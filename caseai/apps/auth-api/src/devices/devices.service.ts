import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DevicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  async register(userId: string, deviceIdHash: string) {
    const maxDevices = Number(this.config.get('MAX_DEVICES_PER_ACCOUNT') ?? 3);
    const activeDeviceCount = await this.prisma.device.count({
      where: { user_id: userId, revoked_at: null }
    });

    const existing = await this.prisma.device.findFirst({
      where: { user_id: userId, device_id_hash: deviceIdHash }
    });

    if (!existing && activeDeviceCount >= maxDevices) {
      throw new BadRequestException('MAX_DEVICES_PER_ACCOUNT exceeded');
    }

    if (existing) {
      return this.prisma.device.update({
        where: { id: existing.id },
        data: { last_seen_at: new Date(), revoked_at: null }
      });
    }

    return this.prisma.device.create({
      data: { user_id: userId, device_id_hash: deviceIdHash }
    });
  }
}
