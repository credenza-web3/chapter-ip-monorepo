import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ConfigService } from '@nestjs/config'
import { randomUUID } from 'crypto'
import type { TBuiltPaginationOptions } from '../common/model/model.dto'
import {
  S3Client,
  PutObjectCommandInput,
  DeleteObjectCommandInput,
  DeleteObjectCommand,
  GetObjectCommand,
  GetObjectCommandInput,
  PutObjectCommand,
  HeadObjectCommandInput,
  HeadObjectCommand,
  CreateMultipartUploadCommand,
  CreateMultipartUploadCommandInput,
  UploadPartCommand,
  UploadPartCommandInput,
  CompleteMultipartUploadCommand,
  CompleteMultipartUploadCommandInput,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { CommonModelService } from '../common/model/model.service'

import { File } from './file.schema'
import { BUCKET_NAME } from './file.constants'
import type { TFindFilesInput } from './file.dto'

@Injectable()
export class FileService extends CommonModelService<File> {
  private r2: S3Client

  constructor(
    @InjectModel(File.name) private fileModel: Model<File>,
    private readonly configService: ConfigService,
  ) {
    super(fileModel)

    const accessKeyId: string = this.configService.get<string>('R2_ACCESS_KEY') as string
    const secretAccessKey: string = this.configService.get<string>('R2_SECRET_KEY') as string

    this.r2 = new S3Client({
      region: 'auto', // required for R2
      endpoint: 'https://3153ffc48832224f2ff5e71db72075f1.r2.cloudflarestorage.com',
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: false, // important for R2
    })
  }

  buildPaginationOptions(opts: TFindFilesInput): TBuiltPaginationOptions {
    const result = super.buildPaginationOptions(opts)
    result.query = {
      ...result.query,
      ...(opts.sub && { sub: opts.sub }),
      ...(opts.key && { key: opts.key }),
      ...(opts.tokenId && { tokenId: opts.tokenId }),
    }
    return result
  }

  getBucketName(): string {
    return `${process.env.NODE_ENV}-${BUCKET_NAME}`
  }

  createKey(filename: string) {
    const date = new Date().toISOString().slice(0, 10)
    return `${date}/${randomUUID()}_${filename.replace(' ', '')}`
  }

  async removeFile(data: DeleteObjectCommandInput) {
    const delete_file_command = new DeleteObjectCommand(data)
    return await this.r2.send(delete_file_command)
  }

  async getFileUrl(opts: GetObjectCommandInput): Promise<string> {
    const url = await getSignedUrl(
      this.r2,
      new GetObjectCommand({
        Bucket: opts.Bucket,
        Key: opts.Key,
      }),
      { expiresIn: 3600 }, // 1 hour
    )
    return url
  }

  async uploadFile(data: PutObjectCommandInput) {
    const command = new PutObjectCommand({
      Bucket: data.Bucket,
      Key: data.Key,
      Body: data.Body,
      ContentType: data.ContentType,
    })
    return await this.r2.send(command)
  }

  async createUploadUrl(opts: PutObjectCommandInput) {
    const command = new PutObjectCommand({
      Bucket: opts.Bucket,
      Key: opts.Key,
      ...(opts.ContentType && { ContentType: opts.ContentType }),
    })
    return await getSignedUrl(this.r2, command, { expiresIn: 60 * 5 })
  }

  async checkFileExists(data: HeadObjectCommandInput) {
    const command = new HeadObjectCommand(data)
    try {
      await this.r2.send(command)
      return true
    } catch {
      return false
    }
  }

  async startMultipartUpload(opts: CreateMultipartUploadCommandInput) {
    const command = new CreateMultipartUploadCommand({
      Bucket: opts.Bucket,
      Key: opts.Key,
      ContentType: opts.ContentType,
    })
    return await this.r2.send(command)
  }

  async getPartUploadUrl(opts: UploadPartCommandInput) {
    const command = new UploadPartCommand({
      Bucket: opts.Bucket,
      Key: opts.Key,
      UploadId: opts.UploadId,
      PartNumber: opts.PartNumber,
    })

    return await getSignedUrl(this.r2, command, { expiresIn: 600 })
  }

  async completeMultipartUpload(opts: CompleteMultipartUploadCommandInput) {
    const command = new CompleteMultipartUploadCommand({
      Bucket: opts.Bucket,
      Key: opts.Key,
      UploadId: opts.UploadId,
      MultipartUpload: { Parts: opts.MultipartUpload?.Parts },
    })
    return await this.r2.send(command)
  }
}
