import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

/** Cabecera negra con botón de volver y una acción opcional a la derecha. */
export function ScreenHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: { label: string; onPress: () => void } }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12} accessibilityLabel="Volver">
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {action && (
          <TouchableOpacity onPress={action.onPress} hitSlop={12}>
            <Text style={styles.action}>{action.label}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.black, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  back: { color: colors.accent, fontSize: 34, fontWeight: '800', lineHeight: 36 },
  title: { color: colors.white, fontSize: 22, fontWeight: '800' },
  subtitle: { color: colors.white, opacity: 0.6, fontSize: 13, marginTop: 2 },
  action: { color: colors.accent, fontSize: 15, fontWeight: '800' },
});
