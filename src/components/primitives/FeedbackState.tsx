import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/theme';

export type FeedbackStateKind = 'empty' | 'loading' | 'error';

export type FeedbackStateProps = {
  kind: FeedbackStateKind;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
};

const fallbackCopy: Record<FeedbackStateKind, { title: string; message: string }> = {
  empty: { title: 'All clear here', message: 'Create a task or drag a card into this column.' },
  loading: { title: 'Organizing the board', message: 'Your tasks are loading.' },
  error: { title: 'The board could not be opened', message: 'Check the connection and try again.' },
};

export function FeedbackState({
  kind,
  title = fallbackCopy[kind].title,
  message = fallbackCopy[kind].message,
  actionLabel,
  onAction,
  compact = false,
}: FeedbackStateProps) {
  const theme = useAppTheme();
  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole={kind === 'error' ? 'alert' : undefined}
      style={[styles.root, compact && styles.compact]}>
      {kind === 'loading' ? (
        <ActivityIndicator accessibilityLabel="Loading" color={theme.text.primary} size="small" />
      ) : (
        <View style={[styles.symbol, { backgroundColor: kind === 'error' ? theme.status.dangerSoft : theme.status.successSoft }]}>
          <Text style={[styles.symbolText, { color: theme.text.primary }]}>{kind === 'empty' ? '✓' : '!'}</Text>
        </View>
      )}
      <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>
      <Text style={[styles.message, { color: theme.text.secondary }]}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={({ pressed }) => [styles.action, { backgroundColor: theme.text.primary }, pressed && styles.actionPressed]}>
          <Text style={[styles.actionText, { color: theme.text.inverse }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    minHeight: 280,
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  compact: { minHeight: 180, paddingHorizontal: 20, paddingVertical: 28 },
  symbol: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginBottom: 4,
    width: 40,
  },
  symbolText: { fontSize: 18, fontWeight: '800' },
  title: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  message: { fontSize: 14, lineHeight: 20, maxWidth: 280, textAlign: 'center' },
  action: { borderRadius: 18, marginTop: 8, paddingHorizontal: 18, paddingVertical: 10 },
  actionPressed: { opacity: 0.72 },
  actionText: { fontSize: 14, fontWeight: '700' },
});
