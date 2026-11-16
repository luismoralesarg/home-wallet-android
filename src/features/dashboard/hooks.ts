import { useQuery } from '@tanstack/react-query';

import { api } from '@/api/client';
import type { components } from '@/api/schema';
import { unwrap } from '@/api/unwrap';

export type DailyIndicator = components['schemas']['DailyIndicator'];
export type UpcomingPayment = components['schemas']['UpcomingPayment'];

export function useDaily() {
  return useQuery({
    queryKey: ['dashboard', 'daily'],
    queryFn: async () => unwrap(await api.GET('/dashboard/daily')),
  });
}

export function useUpcomingPayments(limit: number) {
  return useQuery({
    queryKey: ['dashboard', 'upcoming', limit],
    queryFn: async () => unwrap(await api.GET('/dashboard/upcoming-payments', { params: { query: { limit } } })),
  });
}
