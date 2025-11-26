import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { createPaginatedResponseSchema } from "../../../../apps/backend/src/common/model/model.dto";
import { createPaginatedResponseSchema } from "../../../../apps/backend/src/common/model/model.dto";

const t = initTRPC.create();
const publicProcedure = t.procedure;

const appRouter = t.router({
  app: t.router({
    health: publicProcedure.output(z.object({
      status: z.string(),
      timestamp: z.string(),
      requestId: z.string(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    authTokenPayload: publicProcedure.output(z.any()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    isClientAdmin: publicProcedure.output(z.boolean()).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  auth: t.router({
    refreshToken: publicProcedure.input(z.object({
      refreshToken: z.string(),
    })).output(z.object({
      accessToken: z.string(),
      refreshToken: z.string().optional(),
      idToken: z.string().optional(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    exchangeCode: publicProcedure.input(z.object({
      code: z.string(),
      codeVerifier: z.string(),
      redirectUri: z.string(),
    })).output(z.object({
      accessToken: z.string(),
      refreshToken: z.string().optional(),
      idToken: z.string().optional(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  files: t.router({
    upload: publicProcedure.input(z.object({
      file: z.object({
        filename: z.string(),
        mimetype: z.string(),
        data: z.array(z.number()),
      }),
      tokenId: z.string(),
    })).output(z.object({
      _id: z.string(),
      sub: z.string(),
      key: z.string(),
      bucket: z.string(),
      tokenId: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getFileLink: publicProcedure.input(z
      .object({
        key: z.string().optional(),
        _id: z.string().optional(),
      })
      .refine((data) => Boolean(data._id || data.key), {
        message: 'Either `_id` or `key` must be provided.',
        path: ['key'],
      })).output(z.object({
        url: z.string(),
      })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getFileUploadUrl: publicProcedure.input(z.object({
      filename: z.string(),
      mimetype: z.string().optional(),
    })).output(z.object({
      url: z.string(),
      key: z.string(),
      bucket: z.string(),
    })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    registerUploadedFile: publicProcedure.input(z.object({
      key: z.string(),
      bucket: z.string(),
      tokenId: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
    })).output(z.object({
      _id: z.string(),
      sub: z.string(),
      key: z.string(),
      bucket: z.string(),
      tokenId: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    findFiles: publicProcedure.input(z.object({
      id: z.string().optional(),
      limit: z.string().optional(),
      cursor: z.string().optional(),
      sort: z.string().optional(),
      order: z.enum(['asc', 'desc']).optional().default('desc'),
      startCreatedAt: z.string().optional(),
      endCreatedAt: z.string().optional(),
      startUpdatedAt: z.string().optional(),
      endUpdatedAt: z.string().optional(),
    }).extend({
      sub: z.string().optional(),
      tokenId: z.string().optional(),
      key: z.string().optional(),
    })).output(createPaginatedResponseSchema(z.object({
      _id: z.string(),
      sub: z.string(),
      key: z.string(),
      bucket: z.string(),
      tokenId: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  }),
  publisher: t.router({
    setPublisher: publicProcedure.input(z.object({
      title: z.string(),
      avatarUrl: z.string().optional(),
    })).output(z.object({
      _id: z.string(),
      sub: z.string(),
      title: z.string(),
      avatarUrl: z.string().optional(),
      createdAt: z.date(),
      updatedAt: z.date(),
    })).mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    getPublisher: publicProcedure.input(z
      .object({
        sub: z.string().optional(),
        _id: z.string().optional(),
      })
      .refine((data) => Boolean(data._id || data.sub), {
        message: 'Either `_id` or `sub` must be provided.',
        path: ['sub'],
      })).output(z.object({
        _id: z.string(),
        sub: z.string(),
        title: z.string(),
        avatarUrl: z.string().optional(),
        createdAt: z.date(),
        updatedAt: z.date(),
      })).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any),
    findPublishers: publicProcedure.input(z.object({
      id: z.string().optional(),
      limit: z.string().optional(),
      cursor: z.string().optional(),
      sort: z.string().optional(),
      order: z.enum(['asc', 'desc']).optional().default('desc'),
      startCreatedAt: z.string().optional(),
      endCreatedAt: z.string().optional(),
      startUpdatedAt: z.string().optional(),
      endUpdatedAt: z.string().optional(),
    }).extend({
      title: z.string().optional(),
      sub: z.string().optional(),
    })).output(createPaginatedResponseSchema(z.object({
      _id: z.string(),
      sub: z.string(),
      title: z.string(),
      avatarUrl: z.string().optional(),
      createdAt: z.date(),
      updatedAt: z.date(),
    }))).query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any)
  })
});
export type AppRouter = typeof appRouter;

