import { Entypo, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, TextInput, View } from "react-native";

import {
  DeviceAccessPass,
  DeviceAccessPassStatus,
} from "@/src/entities/device-access-pass/model/types";
import { useMyHubItems } from "@/src/features/myhub/hooks/useMyHubItems";
import { AccessPassCard } from "@/src/features/myhub/ui/AccessPassCard";
import { EmptyState } from "@/src/features/myhub/ui/EmptyState";
import { HubTab, MyHubTabs } from "@/src/features/myhub/ui/MyHubTabs";
import { useLocalServices } from "@/src/features/services/hooks/useLocalServices";
import { useServiceAccessAction } from "@/src/features/services/hooks/useServiceAccessAction";
import { AppText } from "@/src/shared/ui/AppText";
import { Card } from "@/src/shared/ui/Card";
import { Header } from "@/src/shared/ui/Header";
import { Screen } from "@/src/shared/ui/Screen";
import { TabFadeScaleIn } from "@/src/shared/ui/TabFadeScaleIn";
import { useAccessPassStore } from "@/src/store/accessPassStore";
import { LockedType, useSecurityStore } from "@/src/store/securityStore";

export default function MyHubScreen() {
  const syncPassStatuses = useAccessPassStore((s) => s.syncPassStatuses);
  const deletePass = useAccessPassStore((s) => s.deletePass);
  const archivePass = useAccessPassStore((s) => s.archivePass);
  const restorePass = useAccessPassStore((s) => s.restorePass);

  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<HubTab>(HubTab.Active);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const setLockedType = useSecurityStore((s) => s.setLockedType);

  const { myPasses } = useMyHubItems({ query });

  useEffect(() => {
    syncPassStatuses();

    const interval = setInterval(() => {
      syncPassStatuses();
    }, 1000);

    return () => clearInterval(interval);
  }, [syncPassStatuses]);

  const activePasses = useMemo(
    () =>
      myPasses.filter(
        (pass) => pass.status !== DeviceAccessPassStatus.Archived,
      ),
    [myPasses],
  );

  const archivedPasses = useMemo(
    () =>
      myPasses.filter(
        (pass) => pass.status === DeviceAccessPassStatus.Archived,
      ),
    [myPasses],
  );

  const source = tab === HubTab.Active ? activePasses : archivedPasses;

  const filteredPasses = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return source;
    }

    return source.filter((pass) =>
      pass.serviceName.toLowerCase().includes(normalized),
    );
  }, [query, source]);

  const sortedPasses = useMemo(() => {
    return [...filteredPasses].sort((a, b) => {
      const aExpires = a.expiresAt
        ? new Date(a.expiresAt).getTime()
        : Number.MAX_SAFE_INTEGER;
      const bExpires = b.expiresAt
        ? new Date(b.expiresAt).getTime()
        : Number.MAX_SAFE_INTEGER;

      if (aExpires !== bExpires) {
        return aExpires - bExpires;
      }

      const aUpdated = a.updatedAt
        ? new Date(a.updatedAt).getTime()
        : Number.MAX_SAFE_INTEGER;
      const bUpdated = b.updatedAt
        ? new Date(b.updatedAt).getTime()
        : Number.MAX_SAFE_INTEGER;

      return bUpdated - aUpdated;
    });
  }, [filteredPasses]);

  const { services } = useLocalServices();

  const { pendingId, pendingStage, resultMessage, openOrSignIn } =
    useServiceAccessAction();

  const handleOpen = useCallback(
    (pass: DeviceAccessPass) => {
      const service = services.find((s) => s.id === pass.serviceId);
      openOrSignIn(service);
    },
    [services, openOrSignIn],
  );

  const handleArchive = useCallback(
    (pass: DeviceAccessPass) => {
      Alert.alert(
        "Archive access",
        `Archive ${pass.serviceName}? You can restore it later.`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Archive",
            style: "destructive",
            onPress: () => {
              archivePass(pass.id);
            },
          },
        ],
        { cancelable: true },
      );
    },
    [archivePass],
  );

  const handleRestore = useCallback(
    (pass: DeviceAccessPass) => {
      Alert.alert(
        "Restore access",
        `Restore ${pass.serviceName}?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Restore",
            onPress: () => {
              restorePass(pass.id);
            },
          },
        ],
        { cancelable: true },
      );
    },
    [restorePass],
  );

  const handleDisconnect = useCallback((pass: DeviceAccessPass) => {
    Alert.alert(
      "Disconnect access",
      `Remove access from ${pass.serviceName} but keep local history?`,
    );
  }, []);

  const handleDelete = useCallback(
    (pass: DeviceAccessPass) => {
      Alert.alert(
        "Delete access",
        `Delete ${pass.serviceName} from the app and remove related local data?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              deletePass(pass.id);
            },
          },
        ],
        { cancelable: true },
      );
    },
    [deletePass],
  );

  const emptyTitle = useMemo(
    () =>
      query.trim().length > 0
        ? "No matching services"
        : tab === HubTab.Active
          ? "No active access yet"
          : "Archive is empty",
    [query, tab],
  );

  const emptyDescription = useMemo(
    () =>
      query.trim().length > 0
        ? "Try another service name."
        : tab === HubTab.Active
          ? "Scan a QR and connect your first service."
          : "Archived services will appear here.",
    [query, tab],
  );

  useEffect(() => {
    setLockedType(pendingId ? LockedType.Transparent : undefined);
    return () => setLockedType();
  }, [pendingId, setLockedType]);

  return (
    <Screen withTopInset withBottomInset>
      <TabFadeScaleIn>
        <Header
          paddingHorizontal={0}
          paddingTop={15}
          paddingBottom={0}
          title="My Access Hub"
          height={55}
          left={<View className="w-14" />}
          right={
            <Pressable
              onPress={() => router.push("/settings")}
              className="h-14 w-14 items-center justify-center pr-5 pt-1"
            >
              <Entypo name="menu" size={23} color="#d1d5db" />
            </Pressable>
          }
        />

        <View className="pt-3.5 px-6">
          <MyHubTabs
            activTab={tab}
            activeLength={activePasses.length}
            archivedLength={archivedPasses.length}
            onSetTab={(val) => {
              setTab(val);
              setExpandedId(null);
            }}
          />
        </View>

        <View className="px-6 pt-2 pb-3 h-13">
          <View className="flex-row items-center rounded-[14px] bg-slate-950/85 px-4 border border-white/10">
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
              className="py-3.5  text-white"
            />
          </View>
        </View>

        <View className="px-3 flex-1">
          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={{ paddingBottom: 0 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="flex gap-1">
              {sortedPasses.length === 0 ? (
                <EmptyState title={emptyTitle} description={emptyDescription} />
              ) : (
                sortedPasses.map((pass, index) => {
                  const isPending = pendingId === pass.serviceId;

                  return (
                    <AccessPassCard
                      key={`${pass.id}-${index}`}
                      pass={pass}
                      expanded={expandedId === pass.id}
                      loading={isPending}
                      loadingText={pendingStage}
                      onToggle={() =>
                        setExpandedId((current) =>
                          current === pass.id ? null : pass.id,
                        )
                      }
                      onOpen={() => handleOpen(pass)}
                      onArchive={() => handleArchive(pass)}
                      onRestore={() => handleRestore(pass)}
                      onDisconnect={() => handleDisconnect(pass)}
                      onDelete={() => handleDelete(pass)}
                    />
                  );
                })
              )}
            </View>
          </ScrollView>
        </View>
      </TabFadeScaleIn>

      {resultMessage ? (
        <View className="p-4 mb-10">
          <Card>
            <AppText>{resultMessage}</AppText>
          </Card>
        </View>
      ) : null}
    </Screen>
  );
}
