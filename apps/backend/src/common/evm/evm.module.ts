import { Module } from '@nestjs/common'

import { CommonEvmService } from './evm.service'

@Module({
  imports: [],
  controllers: [],
  providers: [CommonEvmService],
  exports: [CommonEvmService],
})
export class CommonEvmModule {}
