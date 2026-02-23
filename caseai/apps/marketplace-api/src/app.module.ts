import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaService } from './prisma.service';
import { JwtStrategy } from './common/jwt.strategy';
import { ListingsModule } from './listings/listings.module';
import { BidsModule } from './bids/bids.module';
import { MatchesModule } from './matches/matches.module';
import { ChatModule } from './chat/chat.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({ throttlers: [{ ttl: 60000, limit: 180 }] }),
    JwtModule.register({}),
    PassportModule,
    ListingsModule,
    BidsModule,
    MatchesModule,
    ChatModule,
    ReviewsModule,
    AdminModule
  ],
  providers: [PrismaService, JwtStrategy]
})
export class AppModule {}
