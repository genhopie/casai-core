import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  listUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        status: true,
        created_at: true,
        last_login_at: true
      },
      orderBy: { created_at: 'desc' },
      take: 200
    });
  }

  revenueSnapshot() {
    return this.prisma.subscription.groupBy({
      by: ['plan_type', 'status'],
      _count: { _all: true }
    });
  }
}
