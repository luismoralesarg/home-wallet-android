import type { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, spacing } from '@/theme';

export function Section({ title, action, children }: { title: string; action?: { label: string; onPress: () => void }; children: ReactNode }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <View style={styles.head}>
        <Text style={styles.title}>{title}</Text>
        {action && (
          <TouchableOpacity onPress={action.onPress} hitSlop={10}>
            <Text style={styles.action}>{action.label}</Text>
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
  action: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
});
