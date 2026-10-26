import { router } from 'expo-router';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { MoneyText } from '@/components/MoneyText';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ErrorBox, PrimaryButton } from '@/components/ui';
import { StatementRow } from '@/features/cards/StatementRow';
import { useCards, type CardOverview } from '@/features/cards/hooks';
import { formatShortDate } from '@/lib/dates';
import { colors, radius, spacing } from '@/theme';

function CardTile({ card }: { card: CardOverview }) {
  const open = card.open_statement;
  return (
    <View style={styles.tile}>
      <TouchableOpacity onPress={() => router.push(`/tarjetas/${card.id}`)} style={{ gap: spacing.md }}>
        <View style={styles.tileHead}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardName}>
              {card.name}
              {card.last4 ? `  ••${card.last4}` : ''}
            </Text>
            <Text style={styles.meta}>
              Cierra el día {card.closing_day} · vence el día {card.due_day}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>

        <View style={styles.openBox}>
          <Text style={styles.openLabel}>Resumen abierto</Text>
          <MoneyText amount={open.total_ars} style={styles.openAmount} />
          <Text style={styles.openMeta}>
            Cierra {formatShortDate(open.closing_date)} · vence {formatShortDate(open.due_date)}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.meta}>Cuotas futuras</Text>
          <MoneyText align="right" amount={card.future_installments_ars} />
        </View>
      </TouchableOpacity>

      {card.closed_unpaid_statements.length > 0 && (
        <View style={{ gap: spacing.sm }}>
          <Text style={styles.sectionLabel}>Por pagar</Text>
          {card.closed_unpaid_statements.map((s) => (
            <StatementRow key={s.month} s={s} highlight="due" onPress={() => router.push(`/tarjetas/${card.id}/${s.month}`)} />
          ))}
        </View>
      )}
    </View>
  );
}

export default function TarjetasScreen() {
  const cards = useCards();
  const data = cards.data;
  return (
    <View style={styles.root}>
      <ScreenHeader title="Tarjetas" action={{ label: '＋ Nueva', onPress: () => router.push('/tarjetas/formulario') }} />
      {cards.isLoading ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.black} />
      ) : cards.isError || !data ? (
        <View style={styles.pad}>
          <ErrorBox message={cards.error instanceof Error ? cards.error.message : 'No se pudieron cargar las tarjetas'} onRetry={() => void cards.refetch()} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={cards.isRefetching} onRefresh={() => void cards.refetch()} />}>
          {data.length === 0 ? (
            <View style={{ gap: spacing.md, alignItems: 'center', marginTop: spacing.xl }}>
              <Text style={styles.empty}>Todavía no cargaste ninguna tarjeta.</Text>
              <PrimaryButton label="Agregar tarjeta" onPress={() => router.push('/tarjetas/formulario')} style={{ alignSelf: 'stretch' }} />
            </View>
          ) : (
            data.map((c) => <CardTile key={c.id} card={c} />)
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  pad: { padding: spacing.lg },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xl * 2 },
  tile: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, gap: spacing.md },
  tileHead: { flexDirection: 'row', alignItems: 'center' },
  cardName: { fontSize: 18, fontWeight: '800', color: colors.text },
  meta: { fontSize: 12, color: colors.textMuted },
  chevron: { fontSize: 28, color: colors.textMuted },
  openBox: { backgroundColor: colors.black, borderRadius: radius.md, padding: spacing.md, gap: 2 },
  openLabel: { color: colors.accent, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  openAmount: { color: colors.white, fontSize: 26, fontWeight: '800' },
  openMeta: { color: colors.white, opacity: 0.7, fontSize: 12 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' },
  empty: { color: colors.textMuted, textAlign: 'center' },
});
