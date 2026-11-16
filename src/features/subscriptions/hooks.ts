import { useQuery } from '@tanstack/react-query';

import { api } from '@/api/client';
import type { components } from '@/api/schema';
import { unwrap } from '@/api/unwrap';

export type Subscription = components['schemas']['Subscription'];

export function useSubscriptions() {
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => unwrap(await api.GET('/subscriptions')),
  });
}
