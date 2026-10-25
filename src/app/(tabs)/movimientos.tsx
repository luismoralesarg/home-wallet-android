import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/AuthProvider';
import { Chip, ErrorBox } from '@/components/ui';
import { useCategories, useTransactions } from '@/features/movements/hooks';
import { TransactionRow } from '@/features/movements/TransactionRow';
import { monthLabel, monthOf, shiftMonth } from '@/lib/dates';
import { colors, radius, spacing, TAB_BAR_HEIGHT } from '@/theme';

export default function MovimientosScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const currentMonth = monthOf(new Date());

  const [month, setMonth] = useState(currentMonth);
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [userId, setUserId] = useState<string | undefined>();

  const categories = useCategories();
  const txs = useTransactions({ month, categoryId, userId });
  const items = useMemo(() => txs.data?.pages.flatMap((p) => p.items) ?? [], [txs.data]);
  const total = txs.data?.pages[0]?.total ?? 0;

  // No hay endpoint de usuarios: se van juntando los que aparecen en los movimientos.
  const [knownUsers, setKnownUsers] = useState<Record<string, string>>({});
  useEffect(() => {
    if (user) setKnownUsers((k) => (k[user.id] ? k : { ...k, [user.id]: user.username }));
  }, [user]);
  useEffect(() => {
    setKnownUsers((k) => {
      const next = { ...k };
      let changed = false;
      for (const t of items) {
        if (next[t.created_by.id] !== t.created_by.name) {
          next[t.created_by.id] = t.created_by.name;
          changed = true;
        }
      }
      return changed ? next : k;
    });
  }, [items]);

  const categoryName = useMemo(() => new Map((categories.data ?? []).map((c) => [c.id, c.name])), [categories.data]);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Movimientos</Text>
          <TouchableOpacity style={styles.add} onPress={() => router.push('/cargar')} accessibilityLabel="Cargar movimiento">
            <Text style={styles.addText}>＋</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.monthRow}>
          <TouchableOpacity hitSlop={12} onPress={() => setMonth((m) => shiftMonth(m, -1))}>
            <Text style={styles.arrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.month}>{monthLabel(month)}</Text>
          <TouchableOpacity hitSlop={12} disabled={month >= currentMonth} onPress={() => setMonth((m) => shiftMonth(m, 1))}>
            <Text style={[styles.arrow, month >= currentMonth && { opacity: 0.25 }]}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="Todos" selected={!userId} onPress={() => setUserId(undefined)} />
          {Object.entries(knownUsers).map(([id, name]) => (
            <Chip key={id} label={id === user?.id ? `${name} (yo)` : name} selected={userId === id} onPress={() => setUserId(id)} />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="Todas las categorías" selected={!categoryId} onPress={() => setCategoryId(undefined)} />
          {(categories.data ?? []).map((c) => (
            <Chip key={c.id} label={c.name} selected={categoryId === c.id} onPress={() => setCategoryId(c.id)} />
          ))}
        </ScrollView>
      </View>

      {txs.isError ? (
        <View style={styles.pad}>
          <ErrorBox message={txs.error instanceof Error ? txs.error.message : 'No se pudieron cargar los movimientos'} onRetry={() => txs.refetch()} />
        </View>
      ) : txs.isLoading ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.black} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(t) => t.id}
          contentContainerStyle={[styles.list, { paddingBottom: TAB_BAR_HEIGHT + 48 }]}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item }) => (
            <TransactionRow tx={item} categoryName={categoryName.get(item.category_id)} onPress={() => router.push({ pathname: '/cargar', params: { id: item.id } })} />
          )}
          ListHeaderComponent={items.length ? <Text style={styles.count}>{total} {total === 1 ? 'movimiento' : 'movimientos'}</Text> : undefined}
          ListEmptyComponent={<Text style={styles.empty}>No hay movimientos en {monthLabel(month)}.</Text>}
          ListFooterComponent={txs.isFetchingNextPage ? <ActivityIndicator style={{ margin: spacing.md }} color={colors.black} /> : undefined}
          onEndReached={() => txs.hasNextPage && !txs.isFetchingNextPage && txs.fetchNextPage()}
          onEndReachedThreshold={0.4}
          refreshControl={<RefreshControl refreshing={txs.isRefetching && !txs.isFetchingNextPage} onRefresh={() => void txs.refetch()} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.black, paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.md },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: colors.white, fontSize: 24, fontWeight: '800' },
  add: { backgroundColor: colors.accent, width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  addText: { color: colors.black, fontSize: 20, fontWeight: '800' },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  month: { color: colors.white, fontSize: 16, fontWeight: '700', textTransform: 'capitalize' },
  arrow: { color: colors.accent, fontSize: 30, fontWeight: '800', paddingHorizontal: spacing.sm },
  filters: { paddingVertical: spacing.sm, gap: spacing.sm },
  chips: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  pad: { padding: spacing.lg },
  list: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  count: { color: colors.textMuted, fontSize: 12, marginBottom: spacing.sm },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
});
