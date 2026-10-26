import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MoneyText } from '@/components/MoneyText';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ErrorBox, PrimaryButton } from '@/components/ui';
import { StatementRow } from '@/features/cards/StatementRow';
import { useCard } from '@/features/cards/hooks';
import { colors, radius, spacing } from '@/theme';

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const card = useCard(id);
  const data = card.data;
  const open = (month: string) => router.push(`/tarjetas/${id}/${month}`);

  return (
    <View style={styles.root}>
      <ScreenHeader
        title={data?.name ?? 'Tarjeta'}
        subtitle={data ? `Cierra el día ${data.closing_day} · vence el día ${data.due_day}` : undefined}
        action={{ label: 'Editar', onPress: () => router.push({ pathname: '/tarjetas/formulario', params: { id } }) }}
      />
      {card.isLoading ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.black} />
      ) : card.isError || !data ? (
        <View style={{ padding: spacing.lg }}>
          <ErrorBox message={card.error instanceof Error ? card.error.message : 'No se pudo cargar la tarjeta'} onRetry={() => void card.refetch()} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={card.isRefetching} onRefresh={() => void card.refetch()} />}>
          <View style={styles.future}>
            <Text style={styles.futureLabel}>Cuotas futuras</Text>
            <MoneyText amount={data.future_installments_ars} style={styles.futureAmount} />
            <Text style={styles.futureHint}>Lo que ya tenés comprometido en resúmenes que todavía no cerraron.</Text>
          </View>

          {data.closed_unpaid_statements.length > 0 && (
            <Section title="Por pagar">
              {data.closed_unpaid_statements.map((s) => (
                <StatementRow key={s.month} s={s} highlight="due" onPress={() => open(s.month)} />
              ))}
            </Section>
          )}

          <Section title="Resumen abierto">
            <StatementRow s={data.open_statement} onPress={() => open(data.open_statement.month)} />
          </Section>

          <Section title="Próximos resúmenes">
            {data.upcoming_statements.map((s) => (
              <StatementRow key={s.month} s={s} onPress={() => open(s.month)} />
            ))}
          </Section>

          <PrimaryButton label="Cargar compra" onPress={() => router.push('/cargar')} />
        </ScrollView>
      )}
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={styles.sectionLabel}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xl * 2 },
  future: { backgroundColor: colors.black, borderRadius: radius.lg, padding: spacing.md, gap: 4 },
  futureLabel: { color: colors.accent, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  futureAmount: { color: colors.white, fontSize: 28, fontWeight: '800' },
  futureHint: { color: colors.white, opacity: 0.7, fontSize: 12 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' },
});
