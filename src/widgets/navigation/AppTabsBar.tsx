import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/src/shared/ui/AppText";

export const AppTabs: Record<string, any> = {
  index: {
    name: "index",
    label: "My Hub",
    iconName: "grid-outline",
    iconSize: 22,
    activeColor: "#0F766E",
    labelClassName: "mt-1 text-[13px] font-medium",
  },
  services: {
    name: "services",
    label: "Services",
    iconName: "layers-outline",
    iconSize: 27,
    activeColor: "#0277BD",
    labelClassName: "mt-[1px] text-[13px] font-medium",
  },
};

export function AppTabsBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        minHeight: 80 + insets.bottom,
        paddingBottom: insets.bottom,
        backgroundColor: "#0B1020",
      }}
    >
      <View className="flex-row px-2 pt-2">
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const { label, iconName, activeColor, iconSize, labelClassName } =
            AppTabs[route.name];

          const color = isFocused ? activeColor : "#6B7280";

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              onLongPress={onLongPress}
              className="flex-1 items-center justify-center py-2"
            >
              <Ionicons name={iconName} size={iconSize} color={color} />
              <AppText className={labelClassName} style={{ color }}>
                {label}
              </AppText>
            </Pressable>
          );
        })}

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/scan-screen")}
          className="flex-1 items-center justify-center pt-3 pb-2"
        >
          <Ionicons name="qr-code-outline" size={22} color="#6B7280" />
          <AppText className="mt-1 text-[13px] font-medium text-[#6B7280]">
            Scan QR
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}
