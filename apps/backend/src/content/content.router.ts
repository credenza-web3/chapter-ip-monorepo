import { randomUUID } from 'node:crypto'

import { ConfigService } from '@nestjs/config'
import { Router, Mutation, Query, Input, Ctx, UseMiddlewares } from 'nestjs-trpc'
import { TRPCError } from '@trpc/server'
import { extension } from 'mime-types'

import { AuthMiddleware } from '../common/auth/auth.middleware'
import type { TAppContextWithTokenPayload } from '../common/auth/auth.types'
import { CommonEvmService } from '../common/evm/evm.service'
import { ContentService } from './content.service'
import { CommonLicenseService } from '../common/license/license.service'

import { ContentModelService } from './content-model.service'
import { FileService } from './file/file.service'
import {
  uploadTokenMetadataInputSchema,
  uploadTokenMetadataOutputSchema,
  type TUploadTokenMetadataInput,
  type TUploadTokenMetadataOutput,
  createUserFileUploadUrlInputSchema,
  type TCreateUserFileUploadUrlInput,
  presignedPutOutputSchema,
  type TPresignedPutOutput,
  createContentFileUploadUrlInputSchema,
  type TCreateContentFileUploadUrlInput,
  registerContentInputSchema,
  registerContentOutputSchema,
  type TRegisterContentInput,
  type TRegisterContentOutput,
  updateContentMetadataInputSchema,
  updateContentMetadataOutputSchema,
  type TUpdateContentMetadataInput,
  type TUpdateContentMetadataOutput,
  registerContentFileInputSchema,
  registerContentFileOutputSchema,
  type TRegisterContentFileInput,
  type TRegisterContentFileOutput,
  removeContentFileInputSchema,
  removeContentFileOutputSchema,
  type TRemoveContentFileInput,
  type TRemoveContentFileOutput,
  findContentInputSchema,
  type TFindContentInput,
  findContentOutputSchema,
  type TFindContentOutput,
  getContentByIdInputSchema,
  getContentByIdOutputSchema,
  type TGetContentByIdInput,
  type TGetContentByIdOutput,
  getContentFileLinkInputSchema,
  getContentFileLinkOutputSchema,
  type TGetContentFileLinkInput,
  type TGetContentFileLinkOutput,
} from './content.dto'

@Router({ alias: 'contents' })
export class ContentRouter {
  constructor(
    private readonly configService: ConfigService,
    private readonly contentService: ContentModelService,
    private readonly fileService: FileService,
    private readonly commonEvmService: CommonEvmService,
    private readonly commonContentService: ContentService,
    private readonly commonLicenseService: CommonLicenseService,
  ) {}

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: createUserFileUploadUrlInputSchema,
    output: presignedPutOutputSchema,
  })
  async createUserFileUploadUrl(
    @Ctx() ctx: TAppContextWithTokenPayload,
    @Input() input: TCreateUserFileUploadUrlInput,
  ): Promise<TPresignedPutOutput> {
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
    input: createContentFileUploadUrlInputSchema,
    output: presignedPutOutputSchema,
  })
  async createContentFileUploadUrl(
    @Ctx() ctx: TAppContextWithTokenPayload,
    @Input() input: TCreateContentFileUploadUrlInput,
  ): Promise<TPresignedPutOutput> {
    const ext = input.extension ? input.extension.replaceAll('.', '') : extension(input.mimetype)
    if (!ext) {
      throw new TRPCError({ message: 'Invalid mimetype', code: 'BAD_REQUEST' })
    }

    const [isOwner, message] = await this.commonContentService.verifyIsOwnerById(
      ctx.authTokenPayload.sub,
      input.contentId,
    )
    if (!isOwner) {
      throw new TRPCError({ message, code: 'FORBIDDEN' })
    }

    const key = `${await this.commonContentService.getContentNftContractAddress()}/${input.contentId}/${randomUUID()}.${ext}`
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
    const subEvmAddress = await this.commonEvmService.getUserEvmAddressBySub(ctx.authTokenPayload.sub)
    try {
      await this.commonContentService.verifyIsOwner(subEvmAddress, input.tokenId)
    } catch (err) {
      throw new TRPCError({ message: (err as Error).message, code: 'FORBIDDEN' })
    }

    const contractAddress = await this.commonContentService.getContentNftContractAddress()
    const sub = ctx.authTokenPayload.sub

    const contentDoc = await this.contentService.create({
      sub,
      tokenId: input.tokenId,
      contractAddress,
      metadata: input.metadata,
    })

    return contentDoc
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: updateContentMetadataInputSchema,
    output: updateContentMetadataOutputSchema,
  })
  async updateContentMetadata(
    @Ctx() ctx: TAppContextWithTokenPayload,
    @Input() input: TUpdateContentMetadataInput,
  ): Promise<TRegisterContentOutput> {
    const [isOwner, message] = await this.commonContentService.verifyIsOwnerById(
      ctx.authTokenPayload.sub,
      input.contentId,
    )
    if (!isOwner) {
      throw new TRPCError({ message, code: 'FORBIDDEN' })
    }

    const updated = await this.contentService.updateById(input.contentId, { metadata: input.metadata })

    return updated!
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: registerContentFileInputSchema,
    output: registerContentFileOutputSchema,
  })
  async registerContentFile(
    @Ctx() ctx: TAppContextWithTokenPayload,
    @Input() input: TRegisterContentFileInput,
  ): Promise<TRegisterContentFileOutput> {
    const [isOwner, message] = await this.commonContentService.verifyIsOwnerById(
      ctx.authTokenPayload.sub,
      input.contentId,
    )
    if (!isOwner) {
      throw new TRPCError({ message, code: 'FORBIDDEN' })
    }

    const expectedPrefix = `${await this.commonContentService.getContentNftContractAddress()}/${input.contentId}/`
    if (!input.key.startsWith(expectedPrefix)) {
      throw new TRPCError({
        message: `Invalid key. Must be under the content folder "${expectedPrefix}"`,
        code: 'BAD_REQUEST',
      })
    }

    const bucket = this.fileService.getBucketName(input.bucket)
    const existsInStorage = await this.fileService.objectExists({
      Bucket: bucket,
      Key: input.key,
    })
    if (!existsInStorage) {
      throw new TRPCError({ message: 'Object is not found in storage', code: 'NOT_FOUND' })
    }

    const existingKey = await this.fileService.findOne({ key: input.key })
    if (existingKey) {
      throw new TRPCError({ message: 'This key is already registered', code: 'CONFLICT' })
    }

    const fileDoc = await this.fileService.create({
      contentId: input.contentId,
      label: input.label ?? '',
      filename: input.filename,
      mimetype: input.mimetype,
      bucket,
      key: input.key,
    })

    return fileDoc
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: removeContentFileInputSchema,
    output: removeContentFileOutputSchema,
  })
  async removeContentFile(
    @Ctx() ctx: TAppContextWithTokenPayload,
    @Input() input: TRemoveContentFileInput,
  ): Promise<TRemoveContentFileOutput> {
    const contentFile = await this.fileService.findById(input.fileId)

    if (!contentFile) {
      throw new TRPCError({ message: 'File is not found', code: 'NOT_FOUND' })
    }

    const [isOwner, message] = await this.commonContentService.verifyIsOwnerById(
      ctx.authTokenPayload.sub,
      contentFile.contentId,
    )
    if (!isOwner) {
      throw new TRPCError({ message, code: 'FORBIDDEN' })
    }

    await this.fileService.removeObject({
      Bucket: contentFile.bucket,
      Key: contentFile.key,
    })

    await this.fileService.getModel().deleteOne({ _id: contentFile._id })

    return { ok: true }
  }

  @Query({
    input: findContentInputSchema,
    output: findContentOutputSchema,
  })
  async findContent(@Input() input: TFindContentInput): Promise<TFindContentOutput> {
    const paginationOptions = this.contentService.buildPaginationOptions(input)

    return await this.contentService.paginate(paginationOptions)
  }

  @Query({
    input: getContentByIdInputSchema,
    output: getContentByIdOutputSchema,
  })
  async getContentById(@Input() input: TGetContentByIdInput): Promise<TGetContentByIdOutput> {
    const content = await this.contentService.findById(input.id)
    if (!content) {
      throw new TRPCError({ message: 'Content is not found', code: 'NOT_FOUND' })
    }

    const files = await this.fileService.find({ contentId: content._id.toString() })
    return {
      ...content.toJSON(),
      files,
    }
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    input: getContentFileLinkInputSchema,
    output: getContentFileLinkOutputSchema,
  })
  async getContentFileLink(
    @Ctx() ctx: TAppContextWithTokenPayload,
    @Input() input: TGetContentFileLinkInput,
  ): Promise<TGetContentFileLinkOutput> {
    const fileQuery = {
      ...(input.key ? { key: input.key } : {}),
      ...(input.id ? { _id: input.id } : {}),
    }
    const contentFile = await this.fileService.findOne(fileQuery)
    if (!contentFile) {
      throw new TRPCError({ message: 'File is not found', code: 'NOT_FOUND' })
    }
    const parent = await this.contentService.findById(contentFile.contentId)
    const subEvmAddress = await this.commonEvmService.getUserEvmAddressBySub(ctx.authTokenPayload.sub)

    const publisherAddress = await this.commonContentService.getOwner(parent!.tokenId)
    const hasMembership = await this.commonContentService.verifyHasSubscription(publisherAddress, subEvmAddress)

    if (!hasMembership) {
      try {
        if (input.licenseTokenId) {
          await this.commonLicenseService.verify(
            ctx.authTokenPayload.sub,
            subEvmAddress,
            parent!.tokenId,
            input.licenseTokenId,
          )
        } else {
          await this.commonContentService.verifyIsOwner(subEvmAddress, parent!.tokenId)
        }
      } catch (err) {
        throw new TRPCError({ message: (err as Error).message, code: 'FORBIDDEN' })
      }
    }

    const url = await this.fileService.getSignedObjectUrl({
      Bucket: contentFile.bucket,
      Key: contentFile.key,
    })

    return { url }
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: uploadTokenMetadataInputSchema,
    output: uploadTokenMetadataOutputSchema,
  })
  async uploadTokenMetadata(
    @Ctx() ctx: TAppContextWithTokenPayload,
    @Input() input: TUploadTokenMetadataInput,
  ): Promise<TUploadTokenMetadataOutput> {
    const contractAddress = await this.commonContentService.getContentNftContractAddress()
    const contentDoc = await this.contentService.findOne({
      contractAddress,
      tokenId: input.tokenId,
      sub: ctx.authTokenPayload.sub,
    })
    if (!contentDoc) {
      throw new TRPCError({ message: 'Content is not found or is not yours', code: 'NOT_FOUND' })
    }

    const metadataKey = `${contractAddress}/${[input.tokenId, 'json'].join('.')}`
    await this.fileService.putObject({
      Body: JSON.stringify(input.metadata, null, 2),
      ContentType: 'application/json',
      Bucket: this.fileService.getBucketName('metadata'),
      Key: metadataKey,
    })

    const metadataBucketHost = this.configService.get<string>('cloudflare.rtwo.metadataBucketHost')
    return { url: `${metadataBucketHost}/${metadataKey}` }
  }
}
