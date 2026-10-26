import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/api/client';
import type { components } from '@/api/schema';
import { unwrap, unwrapEmpty } from '@/api/unwrap';

export type CardOverview = components['schemas']['CardOverview'];
export type CardInput = components['schemas']['CardInput'];
export type CardPatch = components['schemas']['CardPatch'];
export type StatementSummary = components['schemas']['StatementSummary'];
export type StatementDetail = components['schemas']['StatementDetail'];
export type CardPurchase = components['schemas']['CardPurchase'];
export type CardPurchasePatch = components['schemas']['CardPurchasePatch'];

const PAGE_SIZE = 30;

export function useCards() {
  return useQuery({
    queryKey: ['cards'],
    queryFn: async () => unwrap(await api.GET('/cards')),
    retry: false,
  });
}

export function useCard(id: string | undefined) {
  return useQuery({
    queryKey: ['cards', id],
    enabled: !!id,
    queryFn: async () => unwrap(await api.GET('/cards/{id}', { params: { path: { id: id! } } })),
  });
}

export function useStatement(cardId: string, month: string) {
  return useQuery({
    queryKey: ['statement', cardId, month],
    queryFn: async () => unwrap(await api.GET('/cards/{id}/statements/{month}', { params: { path: { id: cardId, month } } })),
  });
}

export function useCardPurchase(cardId: string | undefined, id: string | undefined) {
  return useQuery({
    queryKey: ['card-purchase', cardId, id],
    enabled: !!cardId && !!id,
    queryFn: async () =>
      unwrap(await api.GET('/cards/{id}/purchases/{purchaseId}', { params: { path: { id: cardId!, purchaseId: id! } } })),
  });
}

export type CardPurchaseFilters = { month: string; categoryId?: string; userId?: string };

export function useCardPurchases(f: CardPurchaseFilters) {
  return useInfiniteQuery({
    queryKey: ['card-purchases', f],
    initialPageParam: 0,
    retry: false,
    queryFn: async ({ pageParam }) =>
      unwrap(
        await api.GET('/card-purchases', {
          params: { query: { month: f.month, category_id: f.categoryId, user_id: f.userId, limit: PAGE_SIZE, offset: pageParam } },
        }),
      ),
    getNextPageParam: (last) => (last.offset + last.items.length < last.total ? last.offset + last.limit : undefined),
  });
}

/** Cualquier cambio en tarjetas afecta resúmenes, listados y el indicador diario. */
export function useInvalidateCards() {
  const qc = useQueryClient();
  return () =>
    Promise.all(
      ['cards', 'statement', 'card-purchase', 'card-purchases', 'dashboard'].map((k) => qc.invalidateQueries({ queryKey: [k] })),
    );
}

export function useCreateCard() {
  const invalidate = useInvalidateCards();
  return useMutation({
    mutationFn: async (body: CardInput) => unwrap(await api.POST('/cards', { body })),
    onSuccess: invalidate,
  });
}

export function useUpdateCard(id: string) {
  const invalidate = useInvalidateCards();
  return useMutation({
    mutationFn: async (body: CardPatch) => unwrap(await api.PATCH('/cards/{id}', { params: { path: { id } }, body })),
    onSuccess: invalidate,
  });
}

export function useDeleteCard() {
  const invalidate = useInvalidateCards();
  return useMutation({
    mutationFn: async (id: string) => unwrapEmpty(await api.DELETE('/cards/{id}', { params: { path: { id } } })),
    onSuccess: invalidate,
  });
}

export function usePayStatement(cardId: string, month: string) {
  const invalidate = useInvalidateCards();
  return useMutation({
    mutationFn: async () =>
      unwrap(await api.POST('/cards/{id}/statements/{month}/pay', { params: { path: { id: cardId, month } } })),
    onSuccess: invalidate,
  });
}

export function useSetAdjustment(cardId: string, month: string) {
  const invalidate = useInvalidateCards();
  return useMutation({
    mutationFn: async (amountArs: string) =>
      unwrap(
        await api.PUT('/cards/{id}/statements/{month}/adjustment', {
          params: { path: { id: cardId, month } },
          body: { amount_ars: amountArs },
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useUpdateCardPurchase() {
  const invalidate = useInvalidateCards();
  return useMutation({
    mutationFn: async ({ cardId, id, body }: { cardId: string; id: string; body: CardPurchasePatch }) =>
      unwrap(await api.PATCH('/cards/{id}/purchases/{purchaseId}', { params: { path: { id: cardId, purchaseId: id } }, body })),
    onSuccess: invalidate,
  });
}

export function useDeleteCardPurchase() {
  const invalidate = useInvalidateCards();
  return useMutation({
    mutationFn: async ({ cardId, id }: { cardId: string; id: string }) =>
      unwrapEmpty(await api.DELETE('/cards/{id}/purchases/{purchaseId}', { params: { path: { id: cardId, purchaseId: id } } })),
    onSuccess: invalidate,
  });
}
