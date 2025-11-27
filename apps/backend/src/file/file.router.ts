import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Router, Mutation, Query, Input, Ctx, UseMiddlewares } from 'nestjs-trpc'
import { TRPCError } from '@trpc/server'
import { extension } from 'mime-types'

import { AuthMiddleware } from '../common/auth/auth.middleware'
import type { TAppContextWithTokenPayload } from '../common/auth/auth.types'

import { FileService } from './file.service'
import {
  uploadMetadataInputSchema,
  uploadMetadataOutputSchema,
  type TUploadMetadataInput,
  type TUploadMetadataOutput,
  createContentUploadUrlInputSchema,
  createContentUploadUrlOutputSchema,
  type TCreateContentUploadUrlInput,
  type TCreateContentUploadUrlOutput,
  registerContentInputSchema,
  registerContentOutputSchema,
  type TRegisterContentInput,
  type TRegisterContentOutput,
  findContentInputSchema,
  type TFindContentInput,
  findContentOutputSchema,
  type TFindContentOutput,
  getContentLinkInputSchema,
  getContentLinkOutputSchema,
  type TGetContentLinkInput,
  type TGetContentLinkOutput,
} from './file.dto'

@Router({ alias: 'files' })
export class FileRouter {
  private logger = new Logger(this.constructor.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly fileService: FileService,
  ) {}

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: createContentUploadUrlInputSchema,
    output: createContentUploadUrlOutputSchema,
  })
  async createContentUploadUrl(@Input() input: TCreateContentUploadUrlInput): Promise<TCreateContentUploadUrlOutput> {
    const ext = input.extension ? input.extension.replaceAll('.', '') : extension(input.mimetype)
    if (!ext) {
      throw new Error('Invalid mimetype')
    }
    const key = [input.tokenId, ext].join('.')
    const url = await this.fileService.createUploadUrl({
      Bucket: this.fileService.getBucketName('content'),
      Key: key,
      ContentType: input.mimetype,
    })
    return { url, key }
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: registerContentInputSchema,
    output: registerContentOutputSchema,
  })
  async registerContent(
    @Ctx() ctx: TAppContextWithTokenPayload,
    @Input() input: TRegisterContentInput,
  ): Promise<TRegisterContentOutput> {
    const bucket = this.fileService.getBucketName('content')
    const isFileExists = await this.fileService.checkFileExists({
      Bucket: bucket,
      Key: input.key,
    })
    if (!isFileExists) {
      throw new TRPCError({ message: 'File is not found', code: 'NOT_FOUND' })
    }
    const file = await this.fileService.getModel().create({
      sub: ctx.authTokenPayload.sub,
      key: input.key,
      bucket,
      tokenId: input.tokenId,
    })
    return Object.assign(file.toJSON(), { _id: String(file._id) })
  }

  @Query({
    input: findContentInputSchema,
    output: findContentOutputSchema,
  })
  async findContent(@Input() input: TFindContentInput): Promise<TFindContentOutput> {
    const paginationOptions = this.fileService.buildPaginationOptions(input)
    return await this.fileService.paginate<TFindContentOutput['items'][0]>(paginationOptions)
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    input: getContentLinkInputSchema,
    output: getContentLinkOutputSchema,
  })
  async getContentLink(
    @Ctx() ctx: TAppContextWithTokenPayload,
    @Input() input: TGetContentLinkInput,
  ): Promise<TGetContentLinkOutput> {
    const fileQuery = {
      ...(input.key ? { key: input.key } : {}),
      ...(input._id ? { _id: input._id } : {}),
    }
    const file = await this.fileService.getModel().findOne(fileQuery)
    if (!file) {
      throw new TRPCError({ message: 'File is not found', code: 'NOT_FOUND' })
    }

    // TODO: Implement file access control logic
    // throw new TRPCError({ message: 'You do not have access to this file', code: 'FORBIDDEN' })

    const url = await this.fileService.getFileUrl({
      Bucket: file.bucket,
      Key: file.key,
    })

    return { url }
  }
  
  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: uploadMetadataInputSchema,
    output: uploadMetadataOutputSchema,
  })
  async uploadMetadata(
    @Ctx() ctx: TAppContextWithTokenPayload,
    @Input() input: TUploadMetadataInput,
  ): Promise<TUploadMetadataOutput> {
    const file = await this.fileService
      .getModel()
      .findOne({ tokenId: input.tokenId, sub: ctx.authTokenPayload.sub })
      .lean()
    if (!file) {
      throw new TRPCError({ message: 'Content is not found or is not yours', code: 'NOT_FOUND' })
    }

    const metadataKey = `${input.tokenId}.json`
    await this.fileService.uploadFile({
      Body: JSON.stringify(input.metadata, null, 2),
      ContentType: 'application/json',
      Bucket: this.fileService.getBucketName('metadata'),
      Key: metadataKey,
    })

    const metadataBucketHost = this.configService.get<string>('R2_METADATA_BUCKET_HOST')
    return { url: `${metadataBucketHost}/${metadataKey}` }
  }
}
