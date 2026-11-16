import { useQuery } from '@tanstack/react-query';

import { api } from '@/api/client';
import type { components } from '@/api/schema';
import { unwrap } from '@/api/unwrap';

export type Loan = components['schemas']['Loan'];

export function useLoans() {
  return useQuery({
    queryKey: ['loans'],
    queryFn: async () => unwrap(await api.GET('/loans')),
  });
}
