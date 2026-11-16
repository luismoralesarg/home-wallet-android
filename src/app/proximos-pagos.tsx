import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { ErrorBox } from '@/components/ui';
import { useUpcomingPayments } from '@/features/dashboard/hooks';
import { UpcomingRow } from '@/features/dashboard/UpcomingRow';
import { todayIso } from '@/lib/dates';
import { colors, spacing } from '@/theme';

export default function ProximosPagosScreen() {
  const q = useUpcomingPayments(100);
  const today = todayIso();
  return (
    <View style={styles.root}>
      <ScreenHeader title="Próximos pagos" subtitle="Hasta 60 días. Lo vencido sin pagar figura primero." />
      {q.isLoading ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.black} />
      ) : q.isError || !q.data ? (
        <View style={{ padding: spacing.lg }}>
          <ErrorBox message={q.error instanceof Error ? q.error.message : 'No se pudieron cargar los pagos'} onRetry={() => void q.refetch()} />
        </View>
      ) : (
        <FlatList
          data={q.data}
          keyExtractor={(p) => `${p.type}-${p.ref_id}-${p.month ?? ''}-${p.date}`}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl * 2 }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item }) => <UpcomingRow p={item} today={today} />}
          ListEmptyComponent={<Text style={styles.empty}>No tenés pagos pendientes.</Text>}
          refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => void q.refetch()} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
});
