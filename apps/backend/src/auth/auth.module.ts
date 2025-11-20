import { Module } from '@nestjs/common'

import { AuthService } from './auth.service'
import { AuthRouter } from './auth.router'

@Module({
  imports: [],
  controllers: [],
  providers: [AuthService, AuthRouter],
})
export class AuthModule {}
