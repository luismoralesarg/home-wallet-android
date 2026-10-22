import { StyleSheet, Text, View, type TextStyle } from 'react-native';

import { formatMoney, type Currency } from '@/lib/money';
import { colors } from '@/theme';

type Props = {
  amount: string;
  currency?: Currency;
  /** Equivalente en ARS; obligatorio para mostrarlo cuando la moneda es USD. */
  amountArs?: string;
  style?: TextStyle;
  align?: 'left' | 'right';
};

/**
 * Único componente para mostrar dinero. En USD muestra el monto y debajo,
 * en gris, el equivalente en ARS.
 */
export function MoneyText({ amount, currency = 'ARS', amountArs, style, align = 'left' }: Props) {
  const alignSelf = align === 'right' ? 'flex-end' : 'flex-start';
  return (
    <View style={{ alignItems: alignSelf }}>
      <Text style={[styles.main, style]}>{formatMoney(amount, currency)}</Text>
      {currency === 'USD' && amountArs !== undefined && (
        <Text style={styles.sub}>{formatMoney(amountArs, 'ARS')}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  main: { color: colors.text, fontSize: 16, fontWeight: '700' },
  sub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
});
