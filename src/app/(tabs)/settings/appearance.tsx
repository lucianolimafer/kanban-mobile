import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Appearance, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconButton } from '@/components/primitives/IconButton';
import { useAppTheme } from '@/theme';

export default function AppearanceSettingsScreen() {
  const theme = useAppTheme();
  const isDark = theme.colorScheme === 'dark';

  return (
    <View style={[styles.screen, { backgroundColor: theme.surface.page }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.header}>
          <IconButton accessibilityLabel="Back to settings" icon="‹" onPress={() => router.back()} />
          <View style={styles.headerCopy}>
            <Text style={[styles.eyebrow, { color: theme.text.subtle }]}>APPEARANCE</Text>
            <Text style={[styles.title, { color: theme.text.primary }]}>Colors and theme</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: theme.text.muted }]}>APP THEME</Text>
          <View style={styles.options}>
            {([
              { scheme: 'light' as const, label: 'Light', icon: 'sunny-outline' as const },
              { scheme: 'dark' as const, label: 'Dark', icon: 'moon-outline' as const },
            ]).map((option) => {
              const selected = theme.colorScheme === option.scheme;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  key={option.scheme}
                  onPress={() => Appearance.setColorScheme(option.scheme)}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      backgroundColor: selected ? theme.text.primary : theme.surface.raised,
                      borderColor: selected ? theme.text.primary : theme.border.default,
                    },
                    pressed && styles.pressed,
                  ]}>
                  <Ionicons
                    color={selected ? theme.text.inverse : theme.text.primary}
                    name={option.icon}
                    size={28}
                  />
                  <Text style={[styles.optionLabel, { color: selected ? theme.text.inverse : theme.text.primary }]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.sectionTitle, { color: theme.text.muted }]}>PALETTE PREVIEW</Text>
          <View style={[styles.paletteCard, { backgroundColor: theme.surface.raised, borderColor: theme.border.default }]}>
            {[
              { label: 'Background', color: theme.surface.canvas },
              { label: 'Surface', color: theme.surface.subtle },
              { label: 'Text', color: theme.text.primary },
              { label: 'Accent', color: theme.status.success },
            ].map((item) => (
              <View key={item.label} style={styles.swatchItem}>
                <View style={[styles.swatch, { backgroundColor: item.color, borderColor: theme.border.strong }]} />
                <Text style={[styles.swatchLabel, { color: theme.text.secondary }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  header: { alignItems: 'center', flexDirection: 'row', gap: 14, paddingHorizontal: 18, paddingVertical: 14 },
  headerCopy: { flex: 1 },
  eyebrow: { fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  title: { fontSize: 26, fontWeight: '900', letterSpacing: -0.7, marginTop: 2 },
  content: { gap: 14, paddingHorizontal: 18, paddingTop: 12 },
  sectionTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 1.1, marginLeft: 4, marginTop: 8 },
  options: { flexDirection: 'row', gap: 12 },
  option: { alignItems: 'center', borderRadius: 22, borderWidth: 1, flex: 1, gap: 9, paddingVertical: 22 },
  optionLabel: { fontSize: 14, fontWeight: '800' },
  paletteCard: { borderRadius: 22, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', padding: 18 },
  swatchItem: { alignItems: 'center', gap: 8 },
  swatch: { borderRadius: 18, borderWidth: 1, height: 36, width: 36 },
  swatchLabel: { fontSize: 10, fontWeight: '700' },
  pressed: { opacity: 0.65, transform: [{ scale: 0.98 }] },
});
