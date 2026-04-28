import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose'

export type TEvmEventDocument = HydratedDocument<EvmEvent>

@Schema({
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
  collection: 'evm-events',
})
export class EvmEvent extends Document {
  @Prop({ required: true, index: true })
  contractAddress!: string

  @Prop({ required: true, index: true })
  eventName!: string

  @Prop({ required: true, index: true })
  blockNumber!: number

  @Prop({ required: true, index: true })
  transactionHash!: string

  @Prop({ required: true, index: true })
  logIndex!: number

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  args!: unknown

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  raw!: unknown
}

export const EvmEventSchema = SchemaFactory.createForClass(EvmEvent)
EvmEventSchema.index({ transactionHash: 1, logIndex: 1 }, { unique: true })
