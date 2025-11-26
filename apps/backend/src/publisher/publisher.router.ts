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
  findPublishersInputSchema,
  type TFindPublishersInput,
  findPublishersOutputSchema,
  type TFindPublishersOutput,
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
      { sub: ctx.authTokenPayload.sub },
      {
        title: input.title,
        ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
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
  async getPublisher(@Input() input: TGetPublisherDataInput): Promise<TGetPublisherDataOutput> {
    const query = {
      ...(input.sub ? { sub: input.sub } : {}),
      ...(input._id ? { _id: input._id } : {}),
    }
    const publisher = await this.publisherService.getModel().findOne(query)

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

  @Query({
    input: findPublishersInputSchema,
    output: findPublishersOutputSchema,
  })
  async findPublishers(@Input() input: TFindPublishersInput): Promise<TFindPublishersOutput> {
    const paginationOptions = this.publisherService.buildPaginationOptions(input)
    return await this.publisherService.paginate<TFindPublishersOutput['items'][0]>(paginationOptions)
  }
}
