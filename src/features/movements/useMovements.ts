import { useMemo } from 'react';

import { useCardPurchases } from '@/features/cards/hooks';
import { fromCardPurchase, fromTransaction, mergeStreams } from './items';
import { useTransactions, type TransactionFilters } from './hooks';

/** Transacciones + compras con tarjeta en una sola lista paginada. */
export function useMovements(f: TransactionFilters) {
  const txs = useTransactions(f);
  const purchases = useCardPurchases(f);

  const items = useMemo(
    () =>
      mergeStreams([
        { items: txs.data?.pages.flatMap((p) => p.items.map(fromTransaction)) ?? [], hasMore: !!txs.hasNextPage },
        { items: purchases.data?.pages.flatMap((p) => p.items.map(fromCardPurchase)) ?? [], hasMore: !!purchases.hasNextPage },
      ]),
    [txs.data, txs.hasNextPage, purchases.data, purchases.hasNextPage],
  );

  const hasNextPage = !!txs.hasNextPage || !!purchases.hasNextPage;
  const isFetchingNextPage = txs.isFetchingNextPage || purchases.isFetchingNextPage;

  return {
    items,
    total: (txs.data?.pages[0]?.total ?? 0) + (purchases.data?.pages[0]?.total ?? 0),
    // Sin las transacciones no hay lista; si fallan solo las compras con tarjeta, se avisa y se sigue.
    isLoading: txs.isLoading || (purchases.isLoading && !purchases.isError),
    isError: txs.isError,
    error: txs.error,
    cardsError: purchases.isError,
    isRefetching: (txs.isRefetching || purchases.isRefetching) && !isFetchingNextPage,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage: () => {
      if (txs.hasNextPage && !txs.isFetchingNextPage) void txs.fetchNextPage();
      if (purchases.hasNextPage && !purchases.isFetchingNextPage) void purchases.fetchNextPage();
    },
    refetch: () => Promise.all([txs.refetch(), purchases.refetch()]).then(() => undefined),
  };
}
