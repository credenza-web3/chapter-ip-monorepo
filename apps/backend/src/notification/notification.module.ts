import { Module } from '@nestjs/common'

import { NotificationRouter } from './notification.router'

@Module({
  imports: [],
  controllers: [],
  providers: [NotificationRouter],
})
export class NotificationModule {}
