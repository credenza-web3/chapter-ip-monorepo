import { Module, Global } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'

import { ThrottleModule } from './throttle/throttle.module'
import { CommonModelModule } from './model/model.module'
import { CommonClientModule } from './client/client.module'
import { CommonAuthModule } from './auth/auth.module'
import { CommonEvmModule } from './evm/evm.module'

import { BaseErrorFilter } from './error/base-error.filter'

@Global()
@Module({
  imports: [ThrottleModule, CommonModelModule, CommonClientModule, CommonAuthModule, CommonEvmModule],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: BaseErrorFilter,
    },
  ],
  exports: [ThrottleModule, CommonModelModule, CommonClientModule, CommonAuthModule, CommonEvmModule],
})
export class CommonModule {}
