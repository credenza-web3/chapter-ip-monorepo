import { Catch, ArgumentsHost, HttpException, ConflictException, BadRequestException } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { mongo, MongooseError } from 'mongoose'

@Catch()
export class BaseErrorFilter extends BaseExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const modified_exception = this.makeHttpException(exception)
    super.catch(modified_exception, host)
  }

  private makeHttpException(exception: Error): HttpException {
    if (exception instanceof HttpException) return exception
    if (exception instanceof MongooseError) return new BadRequestException(exception)
    if (exception instanceof mongo.MongoError) {
      if (exception.code === 11000) return new ConflictException(exception)
      // add more code checks
    }
    return new HttpException(exception, 500)
  }
}
