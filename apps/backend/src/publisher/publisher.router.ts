import { Logger } from '@nestjs/common'
import { Router, Mutation, Query, Input, Ctx, UseMiddlewares } from 'nestjs-trpc'
import { TRPCError } from '@trpc/server'

import { AuthMiddleware } from '../common/auth/auth.middleware'
import type { TAppContextWithTokenPayload } from '../common/auth/auth.types'

import { PublisherService } from './publisher.service'
import {
  setPublisherInputSchema,
  type TSetPublisherInput,
  setPublisherOutputSchema,
  type TSetPublisherOutput,
  getPublisherDataInputSchema,
  type TGetPublisherDataInput,
  getPublisherDataOutputSchema,
  type TGetPublisherDataOutput,
} from './publisher.dto'

@Router({ alias: 'publisher' })
export class PublisherRouter {
  private logger = new Logger(this.constructor.name)

  constructor(private readonly publisherService: PublisherService) {}

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: setPublisherInputSchema,
    output: setPublisherOutputSchema,
  })
  async setPublisher(
    @Ctx() ctx: TAppContextWithTokenPayload,
    @Input() input: TSetPublisherInput,
  ): Promise<TSetPublisherOutput> {
    const publisher = await this.publisherService.getModel().findOneAndUpdate(
      { sub: input.sub },
      {
        title: input.title,
        ...(input.avatarUrl && { avatarUrl: input.avatarUrl }),
      },
      { new: true, upsert: true },
    )

    if (!publisher) {
      throw new TRPCError({ message: 'Failed to set publisher data', code: 'INTERNAL_SERVER_ERROR' })
    }

    return {
      _id: String(publisher._id),
      sub: publisher.sub,
      title: publisher.title,
      avatarUrl: publisher.avatarUrl,
      createdAt: publisher.createdAt,
      updatedAt: publisher.updatedAt,
    }
  }

  @Query({
    input: getPublisherDataInputSchema,
    output: getPublisherDataOutputSchema,
  })
  async getPublisherData(@Input() input: TGetPublisherDataInput): Promise<TGetPublisherDataOutput> {
    const publisher = await this.publisherService.getModel().findOne({ sub: input.sub })

    if (!publisher) {
      throw new TRPCError({ message: 'Publisher not found', code: 'NOT_FOUND' })
    }

    return {
      _id: String(publisher._id),
      sub: publisher.sub,
      title: publisher.title,
      avatarUrl: publisher.avatarUrl,
      createdAt: publisher.createdAt,
      updatedAt: publisher.updatedAt,
    }
  }
}
