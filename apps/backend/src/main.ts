process.env.NODE_ENV = process.env.NODE_ENV || 'local'

import { NestFactory } from '@nestjs/core'
import { ConsoleLogger, Logger } from '@nestjs/common'
import { json } from 'body-parser'
import { ConfigService } from '@nestjs/config'

import { AppModule } from './app.module'

async function bootstrap() {
  const env = process.env.NODE_ENV
  const logger = new Logger('Bootstrap')

  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: 'CHAPTER_IP',
      json: env !== 'local',
    }),
  })
  app.use(json({ limit: '10mb' }))
  app.enableCors()

  const configService = app.get(ConfigService)
  // @ts-ignore
  console.log(configService.internalConfig)
  const port = configService.get<number>('port')!

  await app.listen(port, () => {
    logger.log(`🚀 Running at "${port}" in "${env}" mode`)
  })
}
void bootstrap()
