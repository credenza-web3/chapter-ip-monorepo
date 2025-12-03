import { Module } from '@nestjs/common'

import { LicenseRouter } from './license.router'

@Module({
  imports: [],
  controllers: [],
  providers: [LicenseRouter],
  exports: [],
})
export class LicenseModule {}
