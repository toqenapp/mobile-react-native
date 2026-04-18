import { DeviceAccessPassStatus } from "@/src/entities/device-access-pass/model/types";
import { ScrollView, TextInput, View } from "react-native";

import { AppText } from "@/src/shared/ui/AppText";
import { Card } from "@/src/shared/ui/Card";
import { Header } from "@/src/shared/ui/Header";
import { Screen } from "@/src/shared/ui/Screen";
import { ServiceAvatar } from "@/src/shared/ui/ServiceAvatar";
import { useAccessPassStore } from "@/src/store/accessPassStore";
import { useEffect, useMemo, useState } from "react";

function formatTime(timestamp?: string | null) {
  if (!timestamp) return "—";

  return new Date(timestamp).toLocaleString();
}

export default function ArchiveScreen() {
  const [query, setQuery] = useState("");

  const passes = useAccessPassStore((s) => s.passes);
  const syncPassStatuses = useAccessPassStore((s) => s.syncPassStatuses);

  const archived = passes.filter(
    (p) => p.status !== DeviceAccessPassStatus.Active,
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return archived;

    return archived.filter((p) =>
      p.serviceName.toLowerCase().includes(normalized),
    );
  }, [archived, query]);

  useEffect(() => {
    syncPassStatuses();

    const interval = setInterval(() => {
      syncPassStatuses();
    }, 1000);

    return () => clearInterval(interval);
  }, [syncPassStatuses]);

  // useEffect(() => {
  // setTimeout(async () => {
  //   await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  //   await sleep(130);
  //   await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  // }, 2000);
  // setTimeout(
  //   () => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  //   2000,
  // );
  // setTimeout(
  //   () => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  //   4000,
  // );
  // setTimeout(
  //   () => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  //   6000,
  // );
  // setTimeout(
  //   () => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft),
  //   8000,
  // );
  // setTimeout(
  //   () => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid),
  //   10000,
  // );
  // }, [query]);

  return (
    <Screen>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <Header title="Archive" />

        <TextInput
          placeholder="Search services"
          value={query}
          onChangeText={setQuery}
          className="mb-4 rounded-lg border border-neutral-700 px-3 py-3 text-white"
          placeholderTextColor="#888"
        />

        {filtered.length === 0 ? (
          <Card>
            <AppText>No archived access.</AppText>
            <AppText className="mt-2 text-sm text-muted">
              Expired, revoked and archived services will appear here.
            </AppText>
          </Card>
        ) : (
          <View className="gap-3">
            {filtered.map((pass, index) => (
              <Card key={`${pass.id}-${index}`}>
                <View className="flex-row items-center justify-between">
                  <ServiceAvatar
                    name={pass.serviceName}
                    logoUrl={pass.serviceIcon}
                    size={80}
                  />

                  <View className="flex-1">
                    <AppText className="text-lg font-semibold">
                      {pass.serviceName}
                    </AppText>

                    <AppText className="mt-1 text-sm text-muted">
                      Status: {pass.status}
                    </AppText>

                    <AppText className="mt-1 text-sm text-muted">
                      Created: {formatTime(pass.createdAt)}
                    </AppText>

                    <AppText className="mt-1 text-sm text-muted">
                      Last used: {formatTime(pass.updatedAt)}
                    </AppText>

                    <AppText className="mt-1 text-sm">
                      Usage: {pass.usageCount}
                      {pass.usageLimit === null
                        ? " / ∞"
                        : ` / ${pass.usageLimit}`}
                    </AppText>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
