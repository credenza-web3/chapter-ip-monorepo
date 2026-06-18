import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { mongo } from 'mongoose'

import { NOTIFICATION_TYPE } from '@repo/notifications'

import { EvmEventService } from '../evm-listener/evm-event.service'
import { EvmEvent } from '../evm-listener/evm-event.schema'
import { ContentModelService } from '../content/content-model.service'
import { ContentService } from '../content/content.service'
import { PurchaseHistoryService } from '../content/purchase-history/purchase-history.service'

import { CommonNotificationService } from '../common/notification/notification.service'
import { type TCommonNotificationDocument } from '../common/notification/notification.schema'
import { CommonEvmService } from '../common/evm/evm.service'

@Injectable()
export class NotificationService implements OnModuleInit {
  private logger = new Logger(this.constructor.name)
  private evmEventsChangeStream!: mongo.ChangeStream<EvmEvent>
  private evmEventsChangeStreamResumeToken: mongo.ResumeToken = undefined

  constructor(
    private readonly contentService: ContentService,
    private readonly contentModelService: ContentModelService,
    private readonly evmEventService: EvmEventService,
    private readonly commonEvmService: CommonEvmService,
    private readonly commonNotificationService: CommonNotificationService,
    private readonly purchaseHistoryService: PurchaseHistoryService,
  ) {}

  private async restartEvmEventsChangeStream() {
    if (this.evmEventsChangeStream) {
      try {
        this.evmEventsChangeStream.removeAllListeners()
        await this.evmEventsChangeStream.close()
      } catch {
        this.logger.error('Failed to close change stream')
      }
    }

    setTimeout(() => {
      this.logger.log('Restarting change stream...')
      this.startEvmEventsChangeStream()
    }, 2000)
  }

  startEvmEventsChangeStream() {
    this.evmEventsChangeStream = this.evmEventService.getModel().watch([{ $match: { operationType: 'insert' } }], {
      resumeAfter: this.evmEventsChangeStreamResumeToken,
    })
    this.evmEventsChangeStream.on('change', (change: mongo.ChangeStreamDocument<EvmEvent>) => {
      this.evmEventsChangeStreamResumeToken = change._id
      if (change.operationType !== 'insert') return
      void (async () => {
        try {
          const notification: Partial<TCommonNotificationDocument> = {
            payload: { ...change.fullDocument, _id: String(change.fullDocument._id) },
          }
          const eventName = change.fullDocument.eventName
          const contentNftContractAddress = await this.contentService.getContentNftContractAddress()
          const args = change.fullDocument.args as string[]
          switch (eventName) {
            case 'LicenseBought': {
              const tokenId = args[1]
              const toAddress = args[0]?.toLowerCase()
              const toSub = await this.commonEvmService.getSubByEvmAddress(toAddress)

              const content = await this.contentModelService.getModel().findOne({
                contractAddress: contentNftContractAddress,
                tokenId,
              })

              if (!content) {
                this.logger.warn(`Cannot find content for contract: ${change.fullDocument.contractAddress}`)
                return
              }

              await Promise.all([
                this.commonNotificationService
                  .getModel()
                  .insertMany([
                    { ...notification, sub: toSub, type: NOTIFICATION_TYPE.LICENSE_PURCHASED },
                    ...(content.sub !== toSub
                      ? [{ ...notification, sub: content.sub, type: NOTIFICATION_TYPE.LICENSE_SOLD }]
                      : []),
                  ]),
                this.purchaseHistoryService.create({
                  buyerAddress: toAddress,
                  contentId: String(content._id),
                  licenseType: Number(args[2]),
                  priceFiat: String(args[3] ?? '0'),
                  priceEther: String(args[4] ?? '0'),
                  priceToken: String(args[5] ?? '0'),
                  currencyTokenContract: String(args[6] ?? '').toLowerCase(),
                  ownerId: content.sub,
                }),
              ])
              break
            }
            case 'Transfer': {
              if (change.fullDocument.contractAddress !== contentNftContractAddress) return

              const toAddress = args[1]?.toLowerCase()
              const toSub = await this.commonEvmService.getSubByEvmAddress(toAddress)

              await this.commonNotificationService.getModel().create({
                ...notification,
                sub: toSub,
                type: NOTIFICATION_TYPE.CONTENT_CREATED,
              })
              break
            }
            default: {
              this.logger.warn(`Unhandled event: ${change.fullDocument.eventName}`)
              return
            }
          }
        } catch (err) {
          this.logger.error(err)
        }
      })()
    })
    this.evmEventsChangeStream.on('error', (err) => {
      this.logger.error('Change stream error:', err)
      void this.restartEvmEventsChangeStream()
    })
    this.evmEventsChangeStream.on('close', () => {
      this.logger.warn('Change stream closed')
      void this.restartEvmEventsChangeStream()
    })
    this.logger.log('Change stream started')
  }

  onModuleInit() {
    this.startEvmEventsChangeStream()
  }
}
