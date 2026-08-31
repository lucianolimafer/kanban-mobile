import Ionicons from "@expo/vector-icons/Ionicons";
import { GlassView } from "expo-glass-effect";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/theme";

type FloatingTabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];

function FloatingTabBar({
  state,
  descriptors,
  navigation,
  insets,
}: FloatingTabBarProps) {
  const theme = useAppTheme();
  return (
    <View
      style={[
        styles.safeArea,
        {
          backgroundColor: theme.surface.canvas,
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}
    >
      <GlassView
        colorScheme={theme.colorScheme}
        glassEffectStyle="regular"
        isInteractive
        style={[
          styles.bar,
          {
            borderColor: theme.navigation.border,
            shadowColor: theme.navigation.shadow,
          },
        ]}
        tintColor={theme.navigation.glassTint}
      >
        {state.routes.map((route, index) => {
          const options = descriptors[route.key].options;
          const focused = state.index === index;
          const label = route.name === "index" ? "Home" : "Settings";
          const icon =
            route.name === "index" ? "home-outline" : "options-outline";

          const handlePress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              accessibilityLabel={options.tabBarAccessibilityLabel}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              key={route.key}
              onLongPress={() =>
                navigation.emit({ type: "tabLongPress", target: route.key })
              }
              onPress={handlePress}
              style={({ pressed }) => [
                styles.tab,
                focused && { backgroundColor: theme.navigation.active },
                pressed && styles.pressedTab,
              ]}
            >
              <Ionicons
                color={
                  focused
                    ? theme.navigation.activeText
                    : theme.navigation.inactive
                }
                name={icon}
                size={29}
              />
              <Text
                style={[
                  styles.label,
                  {
                    color: focused
                      ? theme.navigation.activeText
                      : theme.navigation.inactive,
                  },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </GlassView>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarAccessibilityLabel: "Open board",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarAccessibilityLabel: "Open settings",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  bar: {
    borderRadius: 38,
    borderWidth: 1,
    flexDirection: "row",
    height: 76,
    padding: 5,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
  },
  tab: {
    alignItems: "center",
    borderRadius: 32,
    flex: 1,
    gap: 2,
    justifyContent: "center",
  },
  pressedTab: { opacity: 0.76 },
  label: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 17,
  },
});
