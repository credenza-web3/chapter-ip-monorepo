import { Injectable } from '@nestjs/common'
import { EventEmitter, on } from 'events'

import type { TNotificationData } from '@credenza-tg-trivia/notifications'

@Injectable()
export class CommonNotificationService {
  private readonly ee = new EventEmitter()

  emit(eventName: string, data: TNotificationData) {
    this.ee.emit(eventName, data)
  }

  async *listen(eventName: string, signal?: AbortSignal) {
    // 'on' turns the event emitter into an async iterator
    // Passing the 'signal' ensures the listener is destroyed if the client disconnects
    for await (const [event] of on(this.ee, eventName, { signal })) {
      yield event
    }
  }
}
