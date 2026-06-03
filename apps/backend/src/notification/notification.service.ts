import { Injectable, Logger, OnModuleInit } from '@nestjs/common'

import { EvmEventService } from '../evm-listener/evm-event.service'

@Injectable()
export class NotificationService implements OnModuleInit {
  private logger = new Logger(this.constructor.name)

  constructor(private readonly evmEventService: EvmEventService) {}

  async listenEvmEvents() {
    console.log('NOTIF service')
    const evmEventModel = this.evmEventService.getModel()
    const stream = evmEventModel.watch([{ $match: { operationType: 'insert' } }])
    console.log(stream)
    return Promise.resolve()
  }

  async onModuleInit() {
    await this.listenEvmEvents()
  }
}
