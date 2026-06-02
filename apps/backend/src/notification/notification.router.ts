import { Logger } from '@nestjs/common'
import { Router, Subscription, UseMiddlewares, Ctx, Options } from 'nestjs-trpc'

import { CommonNotificationService } from '../common/notification/notification.service'
import { AuthMiddleware } from '../common/auth/auth.middleware'
import type { TAppContextWithTokenPayload } from '../common/auth/auth.types'

@Router({ alias: 'notifications' })
export class NotificationRouter {
  private readonly logger = new Logger(this.constructor.name)

  constructor(private readonly commonNotificationService: CommonNotificationService) {}

  @UseMiddlewares(AuthMiddleware)
  @Subscription()
  async *onMessage(@Ctx() ctx: TAppContextWithTokenPayload, @Options() opts: { signal?: AbortSignal }) {
    const eventName = `notifications#${ctx.authTokenPayload.sub}`
    const iterable = this.commonNotificationService.listen(eventName, opts?.signal)
    for await (const event of iterable) {
      yield event
    }
  }
}
