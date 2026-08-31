import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { IconButton } from '@/components/primitives/IconButton';
import { useAppTheme } from '@/theme';

export type BoardHeaderProps = {
  title: string;
  subtitle?: string;
  onToggleTheme?: () => void;
  onAddTask?: () => void;
  isOffline?: boolean;
};

export function BoardHeader({
  title,
  subtitle,
  onToggleTheme,
  onAddTask,
  isOffline = false,
}: BoardHeaderProps) {
  const theme = useAppTheme();
  const isDark = theme.colorScheme === 'dark';
  return (
    <View style={styles.root}>
      <IconButton
        accessibilityLabel={isDark ? 'Enable light theme' : 'Enable dark theme'}
        icon={<Ionicons color={theme.text.primary} name={isDark ? 'sunny-outline' : 'moon-outline'} size={22} />}
        onPress={onToggleTheme}
      />
      <View style={styles.copy}>
        <Text numberOfLines={1} style={[styles.title, { color: theme.text.primary }]}>{title}</Text>
        <View style={styles.subtitleRow}>
          {isOffline ? <View accessibilityLabel="Offline mode" style={[styles.offlineDot, { backgroundColor: theme.status.warning }]} /> : null}
          <Text numberOfLines={1} style={[styles.subtitle, { color: theme.text.subtle }]}>
            {isOffline ? 'Offline · changes saved' : (subtitle ?? 'Drag to organize')}
          </Text>
        </View>
      </View>
      <IconButton accessibilityLabel="Add task" disabled={!onAddTask} icon="+" onPress={onAddTask} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', flexDirection: 'row', gap: 14, paddingHorizontal: 18, paddingVertical: 12 },
  copy: { alignItems: 'center', flex: 1, minWidth: 0 },
  title: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  subtitleRow: { alignItems: 'center', flexDirection: 'row', gap: 5, marginTop: 1 },
  subtitle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.9, textTransform: 'uppercase' },
  offlineDot: { borderRadius: 4, height: 7, width: 7 },
});
