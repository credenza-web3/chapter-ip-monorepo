import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { CommonModelService } from '../../model/model.service'

import { BlockedLicense } from './blocked-license.schema'

@Injectable()
export class BlockedLicenseService extends CommonModelService<BlockedLicense> {
  constructor(@InjectModel(BlockedLicense.name) private blockedLicenseModel: Model<BlockedLicense>) {
    super(blockedLicenseModel)
  }
}
