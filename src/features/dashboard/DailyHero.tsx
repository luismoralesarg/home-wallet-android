import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { MoneyText } from '@/components/MoneyText';
import { dec } from '@/lib/money';
import { colors, radius, spacing } from '@/theme';
import type { DailyIndicator } from './hooks';

/**
 * "Podés gastar hoy": límite del día, barra de lo gastado y, si se pasó, el hero en rojo.
 * Al tocarlo se abre el desglose del cálculo.
 */
export function DailyHero({ daily }: { daily: DailyIndicator }) {
  const [open, setOpen] = useState(false);
  const limit = dec(daily.limite_hoy);
  const spent = dec(daily.gastado_hoy);
  const over = daily.over_limit;
  // Con límite <= 0 el mes ya se pasó del presupuesto: la barra va llena.
  const ratio = limit.lte(0) ? 1 : Math.min(1, spent.div(limit).toNumber());

  const fg = over ? colors.white : colors.black;
  return (
    <>
      <TouchableOpacity activeOpacity={0.85} onPress={() => setOpen(true)} style={[styles.hero, over && styles.heroOver]}>
        {over ? (
          <>
            <Text style={[styles.label, { color: fg }]}>Te pasaste</Text>
            <MoneyText amount={daily.over_amount} style={{ ...styles.amount, color: fg }} />
            {limit.lt(0) ? (
              <Text style={[styles.sub, { color: fg }]}>Entre compromisos y gastos, este mes ya superó tus ingresos.</Text>
            ) : (
              <View style={styles.inline}>
                <Text style={[styles.sub, { color: fg }]}>Tu límite de hoy era </Text>
                <MoneyText amount={daily.limite_hoy} style={{ ...styles.subMoney, color: fg }} />
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={[styles.label, { color: fg }]}>Podés gastar hoy</Text>
            <MoneyText amount={daily.restante_hoy} style={{ ...styles.amount, color: fg }} />
            <Text style={[styles.sub, { color: fg }]}>de un límite de hoy de</Text>
            <MoneyText amount={daily.limite_hoy} style={{ ...styles.subMoney, color: fg }} />
          </>
        )}

        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.round(ratio * 100)}%`, backgroundColor: over ? colors.white : colors.black }]} />
        </View>
        <View style={styles.barLabels}>
          <Text style={[styles.barText, { color: fg }]}>Gastado hoy</Text>
          <MoneyText amount={daily.gastado_hoy} style={{ ...styles.barMoney, color: fg }} />
        </View>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <Text style={styles.sheetTitle}>¿Cómo se calcula?</Text>
            <Row label="Ingresos del mes" amount={daily.breakdown.income_month_ars} />
            <Row label="Tarjetas (resúmenes que vencen)" amount={daily.breakdown.commitments.cards_ars} negative />
            <Row label="Préstamos" amount={daily.breakdown.commitments.loans_ars} negative />
            <Row label="Vehículo" amount={daily.breakdown.commitments.vehicle_ars} negative />
            <Row label="Suscripciones" amount={daily.breakdown.commitments.subscriptions_ars} negative />
            <Row label="Para gastos variables" amount={daily.breakdown.variable_budget_ars} strong />
            <Row label="Gastado hasta ayer" amount={daily.breakdown.variable_spent_until_yesterday_ars} negative />
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Días restantes (con hoy)</Text>
              <Text style={styles.rowDays}>{daily.breakdown.remaining_days}</Text>
            </View>
            <Text style={styles.note}>
              Límite de hoy = (para gastos variables − gastado hasta ayer) ÷ días restantes. Las compras con tarjeta no se descuentan acá: entran cuando vence el resumen.
            </Text>
            <TouchableOpacity style={styles.close} onPress={() => setOpen(false)}>
              <Text style={styles.closeText}>Cerrar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function Row({ label, amount, negative, strong }: { label: string; amount: string; negative?: boolean; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, strong && styles.strong]}>
        {negative ? '− ' : ''}
        {label}
      </Text>
      <MoneyText align="right" amount={amount} style={strong ? styles.strong : undefined} />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.accent, borderRadius: radius.lg, padding: spacing.lg, gap: 2 },
  heroOver: { backgroundColor: colors.danger },
  label: { fontSize: 14, fontWeight: '700', opacity: 0.8 },
  amount: { fontSize: 40, fontWeight: '800', marginVertical: 2 },
  sub: { fontSize: 13, opacity: 0.8 },
  inline: { flexDirection: 'row', alignItems: 'center' },
  subMoney: { fontSize: 13, fontWeight: '700' },
  track: { height: 10, borderRadius: radius.pill, backgroundColor: 'rgba(0,0,0,0.15)', marginTop: spacing.md, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  barText: { fontSize: 12, fontWeight: '600', opacity: 0.8 },
  barMoney: { fontSize: 13, fontWeight: '800' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: spacing.lg },
  sheet: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  rowLabel: { flex: 1, color: colors.text, fontSize: 14 },
  rowDays: { fontWeight: '800', fontSize: 16, color: colors.text },
  strong: { fontWeight: '800' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  note: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: spacing.sm },
  close: { backgroundColor: colors.black, borderRadius: radius.pill, paddingVertical: 14, alignItems: 'center', marginTop: spacing.md },
  closeText: { color: colors.accent, fontWeight: '800' },
});
