import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('notification_dispatch')
class NotificationDispatchProcessor extends WorkerHost {
  async process(job: Job) {
    console.log('notification_dispatch stub', job.id, job.data);
    return { ok: true };
  }
}

@Processor('moderation_auto_score')
class ModerationAutoScoreProcessor extends WorkerHost {
  async process(job: Job) {
    console.log('moderation_auto_score stub', job.id, job.data);
    return { score: 0 };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.getOrThrow<string>('REDIS_URL')
        }
      }),
      inject: [ConfigService]
    }),
    BullModule.registerQueue({ name: 'notification_dispatch' }, { name: 'moderation_auto_score' })
  ],
  providers: [NotificationDispatchProcessor, ModerationAutoScoreProcessor]
})
export class WorkerModule {}
