import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class LicenseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService
  ) {}

  async validate(userId: string) {
    const entitlements = await this.prisma.entitlement.findMany({
      where: { owner_type: 'USER', owner_id: userId }
    });
    const offlineGraceDays = Number(this.config.get('OFFLINE_GRACE_DAYS') ?? 14);
    const offlineToken = await this.jwt.signAsync(
      {
        sub: userId,
        type: 'offline-license'
      },
      {
        secret: this.config.getOrThrow<string>('JWT_OFFLINE_SECRET'),
        expiresIn: `${offlineGraceDays}d`
      }
    );
    return {
      entitlements,
      offlineToken,
      offlineGraceDays
    };
  }
}
