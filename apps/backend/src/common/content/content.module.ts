import { Module } from '@nestjs/common'

import { CommonContentService } from './content.service'

@Module({
  imports: [],
  controllers: [],
  providers: [CommonContentService],
  exports: [CommonContentService],
})
export class CommonContentModule {}
