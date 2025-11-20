import { Module } from '@nestjs/common'

import { CommonAuthService } from './auth.service'
import { AuthMiddleware, AdminAuthMiddleware } from './auth.middleware'

@Module({
  imports: [],
  controllers: [],
  providers: [CommonAuthService, AuthMiddleware, AdminAuthMiddleware],
  exports: [CommonAuthService, AuthMiddleware, AdminAuthMiddleware],
})
export class CommonAuthModule {}
