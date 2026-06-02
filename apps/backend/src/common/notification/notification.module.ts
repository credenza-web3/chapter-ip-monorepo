import { Module } from '@nestjs/common'

import { CommonNotificationService } from './notification.service'

@Module({
  imports: [],
  controllers: [],
  providers: [CommonNotificationService],
  exports: [CommonNotificationService],
})
export class CommonNotificationModule { }
