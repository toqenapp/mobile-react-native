import * as NavigationBar from "expo-navigation-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { Platform } from "react-native";

import AppBootstrap from "@/app/_bootstrap";
import "../global.css";

import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import GlobalOverlay from "./_global-overlay";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === "android") {
      void SystemUI.setBackgroundColorAsync("#0B1020").catch(() => {});
      void NavigationBar.setStyle("light");
    }
  }, []);

  return (
    <>
      <AppBootstrap />
      <SafeAreaProvider style={{ flex: 1, backgroundColor: "#0B1020" }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: "#0B1020",
            },
          }}
        >
          <Stack.Screen name="(tabs)" />
        </Stack>
        <GlobalOverlay />
      </SafeAreaProvider>
    </>
  );
}
