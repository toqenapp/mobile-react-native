import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";

import { AppTabs, AppTabsBar } from "@/src/widgets/navigation/AppTabsBar";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props: BottomTabBarProps) => <AppTabsBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name={AppTabs.index.name} />
      <Tabs.Screen name={AppTabs.services.name} />
    </Tabs>
  );
}
