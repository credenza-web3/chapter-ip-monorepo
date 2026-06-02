import { Injectable } from '@nestjs/common'
import { EventEmitter, on } from 'events'

import type { TNotification } from '@repo/notifications'

import { CommonModelService } from '../model/model.service'
import type { TBuiltPaginationOptions } from '../model/model.dto'

import { CommonNotification } from './notification.schema'
import type { TFindCommonNotificationsInput } from './notification.dto'

@Injectable()
export class CommonNotificationService extends CommonModelService<CommonNotification> {
  private readonly ee = new EventEmitter()

  emit(eventName: string, data: TNotification) {
    this.ee.emit(eventName, data)
  }

  async *listen(eventName: string, signal?: AbortSignal) {
    // 'on' turns the event emitter into an async iterator
    // Passing the 'signal' ensures the listener is destroyed if the client disconnects
    for await (const [event] of on(this.ee, eventName, { signal })) {
      yield event
    }
  }

  buildPaginationOptions(opts: TFindCommonNotificationsInput): TBuiltPaginationOptions {
    const result = super.buildPaginationOptions(opts)
    result.query = {
      ...(opts.sub && { sub: opts.sub }),
      ...(opts.type && { type: opts.type }),
      ...(opts.isRead !== undefined && { readAt: { $ne: null, $exists: true } }),
      ...(opts.isUnread !== undefined && { readAt: null }),
    }
    return result
  }
}
