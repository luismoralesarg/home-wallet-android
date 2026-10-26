import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { MoneyText } from '@/components/MoneyText';
import { formatDateTime } from '@/lib/dates';
import { colors, radius, spacing } from '@/theme';
import type { MovementItem } from './items';

export function MovementRow({
  item,
  categoryName,
  cardName,
  onPress,
}: {
  item: MovementItem;
  categoryName?: string;
  cardName?: string;
  onPress: () => void;
}) {
  const isIncome = item.kind === 'income';
  const meta = [categoryName, item.createdBy.name, formatDateTime(item.date)].filter(Boolean).join(' · ');
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.left}>
        <Text style={styles.title} numberOfLines={1}>
          {item.description || categoryName || (isIncome ? 'Ingreso' : 'Gasto')}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {meta}
        </Text>
        {item.card && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              Tarjeta{cardName ? ` ${cardName}` : ''}
              {item.card.installments > 1 ? ` · ${item.card.installments} cuotas` : ''}
            </Text>
          </View>
        )}
      </View>
      <MoneyText
        align="right"
        amount={item.amount}
        currency={item.currency}
        amountArs={item.amountArs}
        style={isIncome ? { color: colors.success } : undefined}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  left: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  meta: { fontSize: 12, color: colors.textMuted },
  badge: { alignSelf: 'flex-start', backgroundColor: colors.black, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  badgeText: { color: colors.accent, fontSize: 11, fontWeight: '700' },
});
