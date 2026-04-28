import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { EvmEvent, EvmEventSchema } from './evm-event.schema'
import { EvmEventService } from './evm-event.service'
import { EvmListenerService } from './evm-listener.service'

@Module({
  imports: [MongooseModule.forFeature([{ name: EvmEvent.name, schema: EvmEventSchema }])],
  providers: [EvmEventService, EvmListenerService],
})
export class EvmListenerModule {}
