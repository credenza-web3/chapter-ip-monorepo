import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Router, Mutation, Query, Input, Ctx, UseMiddlewares } from 'nestjs-trpc'
import { TRPCError } from '@trpc/server'
import { extension } from 'mime-types'

import { AuthMiddleware } from '../common/auth/auth.middleware'
import type { TAppContextWithTokenPayload } from '../common/auth/auth.types'
import { CommonEvmService } from '../common/evm/evm.service'

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
    private readonly commonEvmService: CommonEvmService,
  ) {}

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

    const contract = this.commonEvmService.getContentNftContract()
    const ownerEvmAddress = (await contract.ownerOf(input.tokenId)) as string
    if (ownerEvmAddress.toLowerCase() !== subEvmAddress.toLowerCase()) {
      throw new TRPCError({ message: 'You are not the owner of this NFT', code: 'FORBIDDEN' })
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

    const contract = this.commonEvmService.getContentNftContract()
    const ownerEvmAddress = (await contract.ownerOf(file.tokenId)) as string
    if (ownerEvmAddress.toLowerCase() !== subEvmAddress.toLowerCase()) {
      if (!input.licenseTokenId) {
        throw new TRPCError({ message: 'license token id is required for non-owner ', code: 'FORBIDDEN' })
      }
      const licenseContract = this.commonEvmService.getLicenseNftContract()

      const licenseType = Number(await licenseContract.getTokenLicenseType(input.licenseTokenId))
      switch (licenseType) {
        case 2: {
          const expiresAt = (await licenseContract.getTokenLicenseExpiresAt(input.licenseTokenId)) as number
          if (expiresAt < Date.now() / 1000) {
            throw new TRPCError({ message: 'License expired', code: 'FORBIDDEN' })
          }
          break
        }
        case 1: {
          // TODO block if used
          break
        }
        case 0: {
          break
        }
        default:
          throw new TRPCError({ message: `Unsupported license type (${licenseType})`, code: 'FORBIDDEN' })
      }

      const licenseContentTokenId = (await licenseContract.getTokenLicenseContentNftId(input.licenseTokenId)) as number
      if (String(licenseContentTokenId) !== file.tokenId) {
        throw new TRPCError({ message: 'Invalid license content token ID', code: 'FORBIDDEN' })
      }

      const licenseOwner = (await licenseContract.ownerOf(input.licenseTokenId)) as string
      if (licenseOwner.toLowerCase() !== subEvmAddress.toLowerCase()) {
        throw new TRPCError({ message: 'You are not the owner of this license', code: 'FORBIDDEN' })
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

