import { Logger } from '@nestjs/common'
import { Router, Query, Input, Ctx, UseMiddlewares } from 'nestjs-trpc'

import { AuthMiddleware } from '../common/auth/auth.middleware'
import type { TAppContextWithTokenPayload } from '../common/auth/auth.types'
import { BlockedLicenseService } from '../common/license/blocked-license/blocked-license.service'
import {
  findBlockedLicensesInputSchema,
  findBlockedLicensesOutputSchema,
  type TFindBlockedLicensesInput,
  type TFindBlockedLicensesOutput,
} from '../common/license/blocked-license/blocked-license.dto'

@Router({ alias: 'licenses' })
export class LicenseRouter {
  private logger = new Logger(this.constructor.name)

  constructor(private readonly blockedLicenseService: BlockedLicenseService) {}

  @UseMiddlewares(AuthMiddleware)
  @Query({
    input: findBlockedLicensesInputSchema,
    output: findBlockedLicensesOutputSchema,
  })
  async findBlockedLicenses(
    @Ctx() ctx: TAppContextWithTokenPayload,
    @Input() input: TFindBlockedLicensesInput,
  ): Promise<TFindBlockedLicensesOutput> {
    if (input.subEvmAddress) input.subEvmAddress = input.subEvmAddress.toLowerCase()
    const paginationOptions = this.blockedLicenseService.buildPaginationOptions(input)
    return await this.blockedLicenseService.paginate<TFindBlockedLicensesOutput['items'][0]>(paginationOptions)
  }
}
