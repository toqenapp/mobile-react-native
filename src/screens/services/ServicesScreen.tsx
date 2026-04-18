import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  TextInput,
  View,
} from "react-native";

import { ServiceWithAccess } from "@/src/entities/service/model/types";
import { useLocalServices } from "@/src/features/services/hooks/useLocalServices";
import { useServicesStore } from "@/src/store/servicesStore";

import { DeviceAccessPassStatus } from "@/src/entities/device-access-pass/model/types";
import { useServiceAccessAction } from "@/src/features/services/hooks/useServiceAccessAction";
import { resolveAccessState } from "@/src/features/services/lib/resolveAccessState";
import { ServiceListItem } from "@/src/features/services/ui/ServiceListItem";
import { AppText } from "@/src/shared/ui/AppText";
import { Card } from "@/src/shared/ui/Card";
import { Header } from "@/src/shared/ui/Header";
import { Screen } from "@/src/shared/ui/Screen";
import { TabFadeScaleIn } from "@/src/shared/ui/TabFadeScaleIn";
import { LockedType, useSecurityStore } from "@/src/store/securityStore";

export default function ServicesScreen() {
  const [query, setQuery] = useState("");

  const isHydrated = useServicesStore((state) => state.isHydrated);
  const isRefreshing = useServicesStore((state) => state.isRefreshing);
  const totalCount = useServicesStore((state) => state.totalCount);

  const setLockedType = useSecurityStore((s) => s.setLockedType);

  const normalizedQuery = useMemo(() => query.trim(), [query]);

  const { servicesWithAccess, loading, loadingMore, loadMore } =
    useLocalServices({
      query: normalizedQuery,
      limit: 100,
    });

  const { pendingId, pendingStage, resultMessage, openOrSignIn } =
    useServiceAccessAction();

  const handlePress = useCallback(
    (state: DeviceAccessPassStatus, item: ServiceWithAccess) => {
      switch (state) {
        case DeviceAccessPassStatus.Archived:
        case DeviceAccessPassStatus.Expired:
        case DeviceAccessPassStatus.Used:
        case DeviceAccessPassStatus.None:
        case DeviceAccessPassStatus.Active:
        default:
          void openOrSignIn(item.service);
          break;
      }
    },
    [openOrSignIn],
  );

  useEffect(() => {
    setLockedType(pendingId ? LockedType.Transparent : undefined);
    return () => setLockedType();
  }, [pendingId, setLockedType]);

  if (!isHydrated) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Screen>
      <TabFadeScaleIn>
        <Header title="Services" />
        <View className="flex-1 px-2 pt-3">
          <View className="px-4 pb-3">
            <View className="flex flex-row flex-nowrap items-center gap-2">
              <View className="flex-row items-center rounded-[14px] border border-white/10 bg-slate-950/85 px-4">
                <Ionicons
                  name="search"
                  size={16}
                  color="#8E8E93"
                  style={{ marginRight: 8 }}
                />

                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search"
                  placeholderTextColor="#8E8E93"
                  className="flex-1 py-3.5 text-white"
                />
              </View>
            </View>

            <AppText className="mt-2.5 ml-5 text-[13px] leading-[18px] text-[#8E8E93]">
              {isRefreshing ? "Updating services..." : `${totalCount} services`}
            </AppText>
          </View>

          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator />
            </View>
          ) : (
            <FlatList
              data={servicesWithAccess}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item, index) => `${item.service.id}-${index}`}
              onEndReached={() => {
                void loadMore();
              }}
              onEndReachedThreshold={0.6}
              contentContainerStyle={{ paddingBottom: 24 }}
              renderItem={({ item }) => {
                const service = item.service;
                const accessPass = item.deviceAccessPass;
                const isPending = pendingId === service.id;
                const accessState = resolveAccessState(accessPass);

                const handleItemPress = () => {
                  void handlePress(accessState, item);
                };

                return (
                  <ServiceListItem
                    name={service.name}
                    description={service.description}
                    logoUrl={service.logoUrl ?? null}
                    brandColor={service.brandColor ?? undefined}
                    loading={isPending}
                    loadingText={pendingStage}
                    accessState={accessState}
                    onPress={handleItemPress}
                  />
                );
              }}
              ListFooterComponent={
                loadingMore ? (
                  <View className="py-4">
                    <ActivityIndicator />
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </TabFadeScaleIn>

      {resultMessage ? (
        <View className="px-4 pb-2">
          <Card>
            <AppText>{resultMessage}</AppText>
          </Card>
        </View>
      ) : null}
    </Screen>
  );
}
