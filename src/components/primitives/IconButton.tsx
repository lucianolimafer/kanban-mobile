import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/theme';

export type IconButtonProps = {
  accessibilityLabel: string;
  icon: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
  style?: ViewStyle;
};

export function IconButton({
  accessibilityLabel,
  icon,
  onPress,
  disabled = false,
  selected = false,
  style,
}: IconButtonProps) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.root,
        { backgroundColor: selected ? theme.text.primary : theme.surface.subtle },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      {typeof icon === 'string' ? (
        <Text style={[styles.icon, { color: selected ? theme.text.inverse : theme.text.primary }]}>{icon}</Text>
      ) : icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  pressed: { opacity: 0.68, transform: [{ scale: 0.96 }] },
  disabled: { opacity: 0.4 },
  icon: { fontSize: 24, fontWeight: '400', lineHeight: 26 },
});
