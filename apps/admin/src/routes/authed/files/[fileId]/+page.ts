import { authStore } from '$lib';
import { createClient } from '@repo/trpc/client';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  const fileId = params.fileId;

  const trpcClient = createClient({
    trpcUrl: import.meta.env.VITE_TRPC_URL || 'http://localhost:8060/trpc',
    getAccessTokenFn: () => authStore.state.accessToken!,
  });
  const subRaw = await authStore.getSubFromToken();
  const sub = subRaw ?? undefined

  const paginatedResponse = await trpcClient.files.findContent.query({
    sub,
    id: fileId,
  });
  const tokenId = paginatedResponse.items[0].tokenId

  return { paginatedResponse };
};
