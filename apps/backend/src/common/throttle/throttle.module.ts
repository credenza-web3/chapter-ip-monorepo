import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [],
      inject: [],
      useFactory: () => [
        {
          name: 'default',
          ttl: 1000,
          limit: 3,
        },
      ],
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class ThrottleModule {}
