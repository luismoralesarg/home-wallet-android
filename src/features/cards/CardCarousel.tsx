import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

import { MoneyText } from '@/components/MoneyText';
import { formatShortDate } from '@/lib/dates';
import { colors, radius, spacing } from '@/theme';
import type { CardOverview } from './hooks';

/** Carrusel de tarjetas: resumen abierto (total, cierre y vencimiento) y, debajo, el próximo resumen. */
export function CardCarousel({ cards }: { cards: CardOverview[] }) {
  const { width } = useWindowDimensions();
  const itemWidth = Math.min(width - spacing.lg * 2 - 24, 320);

  if (cards.length === 0) {
    return (
      <TouchableOpacity style={[styles.card, styles.empty, { width: itemWidth }]} onPress={() => router.push('/tarjetas/formulario')}>
        <Text style={styles.emptyTitle}>＋ Agregar tarjeta</Text>
        <Text style={styles.emptyText}>Cargá una tarjeta para ver cuándo cierra y vence cada resumen.</Text>
      </TouchableOpacity>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={itemWidth + spacing.md} decelerationRate="fast" contentContainerStyle={styles.row}>
      {cards.map((c) => {
        const open = c.open_statement;
        const next = c.upcoming_statements[0];
        const toPay = c.closed_unpaid_statements[0];
        return (
          <TouchableOpacity key={c.id} activeOpacity={0.9} style={[styles.card, { width: itemWidth }]} onPress={() => router.push(`/tarjetas/${c.id}`)}>
            <View style={styles.head}>
              <Text style={styles.name} numberOfLines={1}>
                {c.name}
                {c.last4 ? `  ••${c.last4}` : ''}
              </Text>
              {toPay && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Por pagar</Text>
                </View>
              )}
            </View>
            <Text style={styles.label}>Resumen abierto</Text>
            <MoneyText amount={open.total_ars} style={styles.total} />
            <Text style={styles.meta}>
              Cierra {formatShortDate(open.closing_date)} · vence {formatShortDate(open.due_date)}
            </Text>
            {next && (
              <View style={styles.next}>
                <Text style={styles.nextLabel}>Próximo resumen · vence {formatShortDate(next.due_date)}</Text>
                <MoneyText align="right" amount={next.total_ars} style={styles.nextAmount} />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.md, paddingHorizontal: spacing.lg },
  card: { backgroundColor: colors.black, borderRadius: radius.lg, padding: spacing.md, gap: 2 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  name: { color: colors.white, fontSize: 15, fontWeight: '700', flex: 1 },
  badge: { backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { color: colors.black, fontSize: 11, fontWeight: '800' },
  label: { color: colors.accent, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  total: { color: colors.white, fontSize: 26, fontWeight: '800' },
  meta: { color: colors.white, opacity: 0.65, fontSize: 12 },
  next: { marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  nextLabel: { color: colors.white, opacity: 0.75, fontSize: 12, flex: 1 },
  nextAmount: { color: colors.white, fontSize: 14 },
  empty: { justifyContent: 'center', minHeight: 130 },
  emptyTitle: { color: colors.accent, fontSize: 16, fontWeight: '800' },
  emptyText: { color: colors.white, opacity: 0.7, fontSize: 13 },
});
