import { Module } from '@nestjs/common'

import { CommonClientService } from './client.service'
import { ClientInfoMiddleware } from './client.middleware'

@Module({
  imports: [],
  controllers: [],
  providers: [CommonClientService, ClientInfoMiddleware],
  exports: [CommonClientService, ClientInfoMiddleware],
})
export class CommonClientModule {}
