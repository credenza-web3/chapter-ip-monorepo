import { Logger } from '@nestjs/common'
import { Router, Mutation, Query, Input, Ctx, UseMiddlewares } from 'nestjs-trpc'
import { TRPCError } from '@trpc/server'
import { randomUUID } from 'crypto'

import { AuthMiddleware, AdminAuthMiddleware } from '../common/auth/auth.middleware'
import type { TAppContextWithTokenPayload } from '../common/auth/auth.types'

import { FileService } from './file.service'
import {
  uploadFileInputSchema,
  type TUploadFileInput,
  uploadFileOutputSchema,
  type TUploadFileOutput,
  getFileLinkInputSchema,
  getFileLinkOutputSchema,
  type TGetFileLinkInput,
  type TGetFileLinkOutput,
} from './file.dto'

@Router({ alias: 'files' })
export class FileRouter {
  private logger = new Logger(this.constructor.name)

  constructor(private readonly fileService: FileService) {}

  @UseMiddlewares(AuthMiddleware, AdminAuthMiddleware)
  @Mutation({
    input: uploadFileInputSchema,
    output: uploadFileOutputSchema,
  })
  async upload(@Ctx() ctx: TAppContextWithTokenPayload, @Input() input: TUploadFileInput): Promise<TUploadFileOutput> {
    const date = new Date().toISOString().slice(0, 10)
    const key = `${date}/${randomUUID()}_${input.file.filename.replace(' ', '')}`
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
    })
    return {
      _id: String(file._id),
      key,
      bucket,
    }
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

    const url = await this.fileService.getFileUrl({
      Bucket: file.bucket,
      Key: file.key,
    })

    const responseData = { url }

    return responseData

    // TODO: Implement file access control logic
    // if (file.sub === ctx.authTokenPayload.sub) return responseData
    // throw new TRPCError({ message: 'You do not have access to this file', code: 'FORBIDDEN' })
  }
}
