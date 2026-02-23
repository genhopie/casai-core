import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { IsEnum } from 'class-validator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { PrismaService } from '../prisma.service';
import { UsersService } from '../users/users.service';

enum UserStatusDto {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED'
}

class UpdateUserStatusDto {
  @IsEnum(UserStatusDto)
  status!: UserStatusDto;
}

@Controller('/admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService
  ) {}

  @Get('/users')
  users() {
    return this.usersService.listUsers();
  }

  @Get('/revenue-snapshots')
  revenue() {
    return this.usersService.revenueSnapshot();
  }

  @Post('/users/:id/status')
  async updateStatus(
    @Param('id') userId: string,
    @Req() req: { user: { userId: string } },
    @Body() dto: UpdateUserStatusDto
  ) {
    const updated = await this.prisma.user.update({ where: { id: userId }, data: { status: dto.status } });
    await this.prisma.adminAuditLog.create({
      data: {
        actor_user_id: req.user.userId,
        action_type: 'DISABLE_USER',
        target_type: 'USER',
        target_id: userId,
        metadata: { status: dto.status }
      }
    });
    return { id: updated.id, status: updated.status };
  }
}
