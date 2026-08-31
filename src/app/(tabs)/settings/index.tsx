import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/theme';

const destinations = [
  {
    title: 'Manage columns',
    description: 'Create, rename, reorder, and choose which columns appear on the board.',
    icon: 'albums-outline' as const,
    route: '/settings/columns' as const,
  },
  {
    title: 'Colors and theme',
    description: 'Choose a light or dark appearance and preview the app palette.',
    icon: 'color-palette-outline' as const,
    route: '/settings/appearance' as const,
  },
];

export default function SettingsHomeScreen() {
  const theme = useAppTheme();

  return (
    <View style={[styles.screen, { backgroundColor: theme.surface.page }]}>
      <StatusBar style={theme.colorScheme === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: theme.text.subtle }]}>PERSONALIZATION</Text>
          <Text style={[styles.title, { color: theme.text.primary }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Organize the board and tailor the Flowboard experience.
          </Text>
        </View>

        <View style={styles.destinations}>
          {destinations.map((destination) => (
            <Pressable
              accessibilityHint={destination.description}
              accessibilityRole="button"
              key={destination.route}
              onPress={() => router.push(destination.route)}
              style={({ pressed }) => [
                styles.destination,
                { backgroundColor: theme.surface.raised, borderColor: theme.border.default },
                pressed && styles.pressed,
              ]}>
              <View style={[styles.iconBox, { backgroundColor: theme.surface.subtle }]}>
                <Ionicons color={theme.text.primary} name={destination.icon} size={25} />
              </View>
              <View style={styles.destinationCopy}>
                <Text style={[styles.destinationTitle, { color: theme.text.primary }]}>
                  {destination.title}
                </Text>
                <Text style={[styles.destinationDescription, { color: theme.text.secondary }]}>
                  {destination.description}
                </Text>
              </View>
              <Ionicons color={theme.text.subtle} name="chevron-forward" size={21} />
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 22, paddingBottom: 22, paddingTop: 16 },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  title: { fontSize: 34, fontWeight: '900', letterSpacing: -1, marginTop: 3 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 8, maxWidth: 310 },
  destinations: { gap: 12, paddingHorizontal: 18 },
  destination: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    minHeight: 104,
    padding: 16,
  },
  iconBox: { alignItems: 'center', borderRadius: 18, height: 52, justifyContent: 'center', width: 52 },
  destinationCopy: { flex: 1 },
  destinationTitle: { fontSize: 17, fontWeight: '800' },
  destinationDescription: { fontSize: 12, lineHeight: 17, marginTop: 4 },
  pressed: { opacity: 0.65, transform: [{ scale: 0.99 }] },
});
