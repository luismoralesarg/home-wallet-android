import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/theme';

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

/** Selector de una opción entre pocas (Gasto/Ingreso, ARS/USD). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  disabled,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <View style={[styles.segmented, disabled && { opacity: 0.5 }]}>
      {options.map((o) => (
        <TouchableOpacity
          key={o.value}
          disabled={disabled}
          style={[styles.segment, o.value === value && styles.segmentSelected]}
          onPress={() => onChange(o.value)}
        >
          <Text style={[styles.segmentText, o.value === value && styles.segmentTextSelected]}>{o.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  variant = 'dark',
  style,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'dark' | 'danger' | 'light';
  style?: StyleProp<ViewStyle>;
}) {
  const off = disabled || loading;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={off}
      style={[styles.button, variant === 'danger' && styles.buttonDanger, variant === 'light' && styles.buttonLight, off && { opacity: 0.5 }, style]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'danger' ? colors.danger : variant === 'light' ? colors.text : colors.accent} />
      ) : (
        <Text style={[styles.buttonText, variant === 'danger' && { color: colors.danger }, variant === 'light' && { color: colors.text }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.errorBox}>
      <Text style={styles.errorText}>{message}</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry}>
          <Text style={styles.retry}>Reintentar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.black, borderColor: colors.black },
  chipText: { color: colors.text, fontWeight: '600', fontSize: 14 },
  chipTextSelected: { color: colors.accent },
  segmented: { flexDirection: 'row', backgroundColor: colors.border, borderRadius: radius.pill, padding: 4 },
  segment: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radius.pill },
  segmentSelected: { backgroundColor: colors.black },
  segmentText: { fontWeight: '700', color: colors.textMuted },
  segmentTextSelected: { color: colors.accent },
  label: { fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  button: { backgroundColor: colors.black, borderRadius: radius.pill, paddingVertical: 16, alignItems: 'center' },
  buttonDanger: { backgroundColor: colors.dangerSoft },
  buttonLight: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  buttonText: { color: colors.accent, fontSize: 16, fontWeight: '800' },
  errorBox: { backgroundColor: colors.dangerSoft, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  errorText: { color: colors.danger, fontSize: 14 },
  retry: { color: colors.danger, fontWeight: '800' },
});
