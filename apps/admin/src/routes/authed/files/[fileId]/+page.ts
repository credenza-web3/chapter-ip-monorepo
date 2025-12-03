import { authStore } from '$lib';
import { createClient } from '@repo/trpc/client';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  const trpcClient = createClient({
    trpcUrl: import.meta.env.VITE_TRPC_URL || 'http://localhost:8060/trpc',
    getAccessTokenFn: () => authStore.state.accessToken!,
  });
  console.log(params, 'params');
  const subRaw = await authStore.getSubFromToken();
  const sub = subRaw ?? undefined
  const fileId = params.fileId;
  const paginatedResponse = await trpcClient.files.findContent.query({
    sub,
    id: fileId,
  });

  return { paginatedResponse };
};
