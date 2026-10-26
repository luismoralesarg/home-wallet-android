import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/api/client';
import type { components } from '@/api/schema';
import { unwrap, unwrapEmpty } from '@/api/unwrap';

export type Category = components['schemas']['Category'];
export type Transaction = components['schemas']['Transaction'];
export type TransactionInput = components['schemas']['TransactionInput'];
export type TransactionPatch = components['schemas']['TransactionPatch'];
export type CardPurchaseInput = components['schemas']['CardPurchaseInput'];

const PAGE_SIZE = 30;

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => unwrap(await api.GET('/categories', {})),
    staleTime: 5 * 60_000,
  });
}

export function useExchangeRate() {
  return useQuery({
    queryKey: ['exchange-rate'],
    queryFn: async () => unwrap(await api.GET('/exchange-rate/today')),
    staleTime: 60 * 60_000,
  });
}

export type TransactionFilters = { month: string; categoryId?: string; userId?: string };

export function useTransactions(f: TransactionFilters) {
  return useInfiniteQuery({
    queryKey: ['transactions', f],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) =>
      unwrap(
        await api.GET('/transactions', {
          params: { query: { month: f.month, category_id: f.categoryId, user_id: f.userId, limit: PAGE_SIZE, offset: pageParam } },
        }),
      ),
    getNextPageParam: (last) => (last.offset + last.items.length < last.total ? last.offset + last.limit : undefined),
  });
}

export function useTransaction(id: string | undefined) {
  return useQuery({
    queryKey: ['transaction', id],
    enabled: !!id,
    queryFn: async () => unwrap(await api.GET('/transactions/{id}', { params: { path: { id: id! } } })),
  });
}

/** Un movimiento cambia el indicador diario, los próximos pagos y las tarjetas. */
function useInvalidateMoney() {
  const qc = useQueryClient();
  return () =>
    Promise.all(
      ['transactions', 'transaction', 'card-purchases', 'statement', 'dashboard', 'cards'].map((k) =>
        qc.invalidateQueries({ queryKey: [k] }),
      ),
    );
}

export function useCreateTransaction() {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: async (body: TransactionInput) => unwrap(await api.POST('/transactions', { body })),
    onSuccess: invalidate,
  });
}

export function useUpdateTransaction(id: string) {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: async (body: TransactionPatch) =>
      unwrap(await api.PATCH('/transactions/{id}', { params: { path: { id } }, body })),
    onSuccess: invalidate,
  });
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: async (id: string) => unwrapEmpty(await api.DELETE('/transactions/{id}', { params: { path: { id } } })),
    onSuccess: invalidate,
  });
}

export function useCreateCardPurchase() {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: async ({ cardId, body }: { cardId: string; body: CardPurchaseInput }) =>
      unwrap(await api.POST('/cards/{id}/purchases', { params: { path: { id: cardId } }, body })),
    onSuccess: invalidate,
  });
}
