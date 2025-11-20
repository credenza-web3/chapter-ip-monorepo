import { All, Controller, Inject, OnModuleInit } from '@nestjs/common'
import { renderTrpcPanel } from 'trpc-ui-zod4'
import { AnyRouter } from '@trpc/server'
import { AppRouterHost } from 'nestjs-trpc'

@Controller()
export class TrpcPanelController implements OnModuleInit {
  private appRouter!: AnyRouter

  constructor(@Inject(AppRouterHost) private readonly appRouterHost: AppRouterHost) {}

  onModuleInit() {
    this.appRouter = this.appRouterHost.appRouter
  }

  @All('/panel')
  panel() {
    return renderTrpcPanel(this.appRouter, { url: '/trpc' })
  }
}
