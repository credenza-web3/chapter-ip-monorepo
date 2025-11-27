import { Logger } from '@nestjs/common'
import { Router, Mutation, Query, Input, Ctx, UseMiddlewares } from 'nestjs-trpc'
import { TRPCError } from '@trpc/server'

import { AuthMiddleware, AdminAuthMiddleware } from '../common/auth/auth.middleware'
import type { TAppContextWithTokenPayload } from '../common/auth/auth.types'

import { FileService } from './file.service'
import {
  uploadFileInputSchema,
  type TUploadFileInput,
  fileItemSchema,
  type TFileItemOutput,
  getFileLinkInputSchema,
  getFileLinkOutputSchema,
  type TGetFileLinkInput,
  type TGetFileLinkOutput,
  createFileUploadUrlInputSchema,
  createFileUploadUrlOutputSchema,
  type TCreateFileUploadUrlInput,
  type TCreateFileUploadUrlOutput,
  registerUploadedFileInputSchema,
  type TRegisterUploadedFileInput,
  findFilesInputSchema,
  type TFindFilesInput,
  findFilesOutputSchema,
  type TFindFilesOutput,
} from './file.dto'

@Router({ alias: 'files' })
export class FileRouter {
  private logger = new Logger(this.constructor.name)

  constructor(private readonly fileService: FileService) {}

  @UseMiddlewares(AuthMiddleware, AdminAuthMiddleware)
  @Mutation({
    input: uploadFileInputSchema,
    output: fileItemSchema,
  })
  async upload(@Ctx() ctx: TAppContextWithTokenPayload, @Input() input: TUploadFileInput): Promise<TFileItemOutput> {
    const key = this.fileService.createKey(input.file.filename)
    const bucket = this.fileService.getBucketName()
    await this.fileService.uploadFile({
      Body: Buffer.from(input.file.data),
      ContentType: input.file.mimetype,
      Bucket: bucket,
      Key: key,
    })
    const file = await this.fileService.getModel().create({
      sub: ctx.authTokenPayload.sub,
      key,
      bucket,
      tokenId: input.tokenId,
    })
    return Object.assign(file.toJSON(), { _id: String(file._id) })
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: createFileUploadUrlInputSchema,
    output: createFileUploadUrlOutputSchema,
  })
  async createFileUploadUrl(@Input() input: TCreateFileUploadUrlInput): Promise<TCreateFileUploadUrlOutput> {
    const key = this.fileService.createKey(input.filename)
    const bucket = this.fileService.getBucketName()
    const url = await this.fileService.createUploadUrl({
      Bucket: this.fileService.getBucketName(),
      Key: key,
      ContentType: input.mimetype,
    })
    return { url, key, bucket }
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: registerUploadedFileInputSchema,
    output: fileItemSchema,
  })
  async registerUploadedFile(
    @Ctx() ctx: TAppContextWithTokenPayload,
    @Input() input: TRegisterUploadedFileInput,
  ): Promise<TFileItemOutput> {
    const isFileExists = await this.fileService.checkFileExists({
      Bucket: input.bucket,
      Key: input.key,
    })
    if (!isFileExists) {
      throw new TRPCError({ message: 'File is not found', code: 'NOT_FOUND' })
    }
    const file = await this.fileService.getModel().create({
      sub: ctx.authTokenPayload.sub,
      key: input.key,
      bucket: input.bucket,
      tokenId: input.tokenId,
    })
    return Object.assign(file.toJSON(), { _id: String(file._id) })
  }

  @Query({
    input: findFilesInputSchema,
    output: findFilesOutputSchema,
  })
  async findFiles(@Input() input: TFindFilesInput): Promise<TFindFilesOutput> {
    const paginationOptions = this.fileService.buildPaginationOptions(input)
    return await this.fileService.paginate<TFindFilesOutput['items'][0]>(paginationOptions)
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    input: getFileLinkInputSchema,
    output: getFileLinkOutputSchema,
  })
  async getFileLink(
    @Ctx() ctx: TAppContextWithTokenPayload,
    @Input() input: TGetFileLinkInput,
  ): Promise<TGetFileLinkOutput> {
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
}

