import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Router, Mutation, Query, Input, Ctx, UseMiddlewares } from 'nestjs-trpc'
import { TRPCError } from '@trpc/server'
import { extension } from 'mime-types'

import { AuthMiddleware } from '../common/auth/auth.middleware'
import type { TAppContextWithTokenPayload } from '../common/auth/auth.types'
import { CommonEvmService } from '../common/evm/evm.service'
import { CommonContentService } from '../common/content/content.service'
import { CommonLicenseService } from '../common/license/license.service'

import { FileService } from './file.service'
import {
  uploadMetadataInputSchema,
  uploadMetadataOutputSchema,
  type TUploadMetadataInput,
  type TUploadMetadataOutput,
  createUserFileUploadUrlInputSchema,
  type TCreateUserFileUploadUrlInput,
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
    private readonly commonEvmService: CommonEvmService,
    private readonly commonContentService: CommonContentService,
    private readonly commonLicenseService: CommonLicenseService,
  ) {}

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: createUserFileUploadUrlInputSchema,
    output: createContentUploadUrlOutputSchema,
  })
  async createUserFileUploadUrl(
    @Ctx() ctx: TAppContextWithTokenPayload,
    @Input() input: TCreateUserFileUploadUrlInput,
  ): Promise<TCreateContentUploadUrlOutput> {
    const ext = input.extension ? input.extension.replaceAll('.', '') : extension(input.mimetype)
    if (!ext) {
      throw new TRPCError({ message: 'Invalid mimetype', code: 'BAD_REQUEST' })
    }

    const key = `${ctx.authTokenPayload.sub}/${input.filename}.${ext}`
    const url = await this.fileService.createUploadUrl({
      Bucket: this.fileService.getBucketName(input.bucket),
      Key: key,
      ContentType: input.mimetype,
    })
    return { url, key }
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: createContentUploadUrlInputSchema,
    output: createContentUploadUrlOutputSchema,
  })
  async createContentUploadUrl(
    @Ctx() ctx: TAppContextWithTokenPayload,
    @Input() input: TCreateContentUploadUrlInput,
  ): Promise<TCreateContentUploadUrlOutput> {
    const ext = input.extension ? input.extension.replaceAll('.', '') : extension(input.mimetype)
    if (!ext) {
      throw new TRPCError({ message: 'Invalid mimetype', code: 'BAD_REQUEST' })
    }

    const subEvmAddress = await this.commonEvmService.getUserEvmAddressBySub(ctx.authTokenPayload.sub)

    try {
      await this.commonContentService.verifyIsOwner(subEvmAddress, input.tokenId)
    } catch (err) {
      throw new TRPCError({ message: (err as Error).message, code: 'FORBIDDEN' })
    }

    const key = `${await this.commonContentService.getContentNftContractAddress()}/${[input.tokenId, ext].join('.')}`
    const url = await this.fileService.createUploadUrl({
      Bucket: this.fileService.getBucketName(input.bucket),
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
    const contractAddress = await this.commonContentService.getContentNftContractAddress()
    if (!input.key.startsWith(contractAddress)) {
      throw new TRPCError({ message: 'Invalid key. Must start with contract address', code: 'NOT_FOUND' })
    }
    const file = await this.fileService.getModel().create({
      sub: ctx.authTokenPayload.sub,
      key: input.key,
      bucket,
      tokenId: input.tokenId,
      contractAddress,
    })
    return file.toJSON()
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
      ...(input.id ? { _id: input.id } : {}),
    }
    const file = await this.fileService.getModel().findOne(fileQuery)
    if (!file) {
      throw new TRPCError({ message: 'File is not found', code: 'NOT_FOUND' })
    }

    const subEvmAddress = await this.commonEvmService.getUserEvmAddressBySub(ctx.authTokenPayload.sub)

    const publisherAddress = await this.commonContentService.getOwner(file.tokenId)
    const hasMembership = await this.commonContentService.verifyHasSubscription(publisherAddress, subEvmAddress)

    if (!hasMembership) {
      try {
        if (input.licenseTokenId) {
          await this.commonLicenseService.verify(
            ctx.authTokenPayload.sub,
            subEvmAddress,
            file.tokenId,
            input.licenseTokenId,
          )
        } else {
          await this.commonContentService.verifyIsOwner(subEvmAddress, file.tokenId)
        }
      } catch (err) {
        throw new TRPCError({ message: (err as Error).message, code: 'FORBIDDEN' })
      }
    }

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
    const contractAddress = await this.commonContentService.getContentNftContractAddress()
    const file = await this.fileService
      .getModel()
      .findOne({ contractAddress, tokenId: input.tokenId, sub: ctx.authTokenPayload.sub })
      .lean()
    if (!file) {
      throw new TRPCError({ message: 'Content is not found or is not yours', code: 'NOT_FOUND' })
    }

    const metadataKey = `${contractAddress}/${[input.tokenId, 'json'].join('.')}`
    await this.fileService.uploadFile({
      Body: JSON.stringify(input.metadata, null, 2),
      ContentType: 'application/json',
      Bucket: this.fileService.getBucketName('metadata'),
      Key: metadataKey,
    })

    const metadataBucketHost = this.configService.get<string>('cloudflare.r2.metadataBucketHost')
    return { url: `${metadataBucketHost}/${metadataKey}` }
  }
}
