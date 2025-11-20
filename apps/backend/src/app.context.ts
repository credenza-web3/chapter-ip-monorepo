import { Injectable, Logger } from '@nestjs/common'
import { ContextOptions, TRPCContext } from 'nestjs-trpc'
import { randomUUID } from 'crypto'
import type { Request, Response } from 'express'

@Injectable()
export class AppContext implements TRPCContext {
  private logger = new Logger('TRPC Request')

  constructor() {}

  async create(opts: ContextOptions): Promise<Record<string, unknown>> {
    const res = opts.res as Response
    const req = opts.req as Request
    const requestId = randomUUID()

    res.setHeader('X-Request-Id', requestId)
    res.removeHeader('X-Powered-By')

    const path = opts.info.url?.pathname.replace('/', '')
    if (!path?.includes('health')) {
      const start = Date.now()
      res.once('finish', () => {
        const duration = Date.now() - start
        this.logger.log(`[${requestId}] ${opts.info.type.toUpperCase()} ${path} - ${duration}ms)`)
      })
    }

    return await Promise.resolve({ requestId, req, res })
  }
}

export type TAppContext = {
  requestId: string
  req: Request
  res: Response
}
