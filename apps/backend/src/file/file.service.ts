import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ConfigService } from '@nestjs/config'
import {
  S3Client,
  PutObjectCommandInput,
  DeleteObjectCommandInput,
  DeleteObjectCommand,
  GetObjectCommand,
  GetObjectCommandInput,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { CommonModelService } from '../common/model/model.service'

import { File } from './file.schema'
import { BUCKET_NAME } from './file.constants'

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

  getBucketName(): string {
    return `${process.env.NODE_ENV}-${BUCKET_NAME}`
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
}
