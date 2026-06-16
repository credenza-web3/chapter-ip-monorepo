import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ContentModelService } from './content-model.service'
import { ContentRouter } from './content.router'
import { ContentSchema, Content } from './content.schema'
import { ContentFileSchema, ContentFile } from './file/file.schema'
import { FileService } from './file/file.service'
import { PurchaseHistoryItemSchema, PurchaseHistoryItem } from './purchase-history/purchase-history-item.schema'
import { PurchaseHistoryService } from './purchase-history/purchase-history.service'
import { ContentService } from './content.service'
import { EvmListenerModule } from '../evm-listener/evm-listener.module'

@Module({
  imports: [
    EvmListenerModule,
    MongooseModule.forFeature([
      { name: Content.name, schema: ContentSchema },
      { name: ContentFile.name, schema: ContentFileSchema },
      { name: PurchaseHistoryItem.name, schema: PurchaseHistoryItemSchema },
    ]),
  ],
  controllers: [],
  providers: [ContentModelService, ContentService, FileService, PurchaseHistoryService, ContentRouter],
  exports: [ContentModelService, ContentService, PurchaseHistoryService],
})
export class ContentModule {}
