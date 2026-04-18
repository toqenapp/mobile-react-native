import { Entypo } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import {
  DeviceAccessPass,
  DeviceAccessPassStatus,
  PendingStage,
} from "@/src/entities/device-access-pass/model/types";
import { formatDate } from "@/src/shared/lib/formatDate";
import { getLabels } from "@/src/shared/lib/getLabels";
import { AppText } from "@/src/shared/ui/AppText";
import { SeparatorLoader } from "@/src/shared/ui/SeparatorLoader";
import { ServiceAvatar } from "@/src/shared/ui/ServiceAvatar";
import { getUsageText } from "../lib/getUsageText";
import { SectionRow } from "./SectionRow";

export function AccessPassCard({
  pass,
  expanded,
  loading,
  loadingText,
  onToggle,
  onOpen,
  onArchive,
  onRestore,
  onDisconnect,
  onDelete,
}: {
  pass: DeviceAccessPass;
  expanded: boolean;
  loading?: boolean;
  loadingText: PendingStage | null;
  onToggle: () => void;
  onOpen: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDisconnect: () => void;
  onDelete: () => void;
}) {
  const createdAt = formatDate(pass.createdAt);
  const updatedAt = formatDate(pass.updatedAt);
  const expiresAt = formatDate(pass.expiresAt);
  const usageText = getUsageText(pass);

  const isArchived = pass.status === DeviceAccessPassStatus.Archived;

  const {
    action: actionLabel,
    status: statusLabel,
    actionColor,
  } = getLabels(pass.status);

  return (
    <Pressable
      onPress={onToggle}
      className="pl-3 py-2.5 rounded-xl bg-white/10"
    >
      <View className="flex-row items-start">
        <ServiceAvatar
          size={40}
          name={pass.serviceName}
          logoUrl={pass.serviceIcon}
          brandColor={pass.brandColor}
        />

        <View className="ml-3.5 flex-1">
          <View className="flex-1 flex-row items-center justify-between">
            <View className="flex-1">
              <AppText className="text-xl font-semibold text-white">
                {pass.serviceName}
              </AppText>

              <View className="flex-row flex-wrap items-center gap-1">
                <AppText className="font-medium text-gray-500">
                  {expiresAt ? <>Expires: {expiresAt}</> : statusLabel}
                </AppText>
                <Entypo
                  name="chevron-down"
                  style={{
                    transform: [{ rotate: expanded ? "180deg" : "0deg" }],
                  }}
                  size={16}
                  color="#6b7280"
                />
              </View>
            </View>

            <Pressable
              onPress={isArchived ? onRestore : onOpen}
              className="pl-2 pr-5 flex items-center justify-center flex-nowrap h-12"
            >
              {loading ? (
                <View className="flex flex-col gap-1">
                  <AppText className="text-sm text-gray-300">
                    {loadingText || "Loading"}…
                  </AppText>
                  <SeparatorLoader show={true} maxWidth={65} />
                </View>
              ) : (
                <View className="flex flex-col items-end">
                  <AppText className={`text-[17px] font-bold ${actionColor}`}>
                    {actionLabel}
                  </AppText>
                </View>
              )}
            </Pressable>
          </View>
        </View>
      </View>

      {expanded ? (
        <View className="pt-1 pl-1 pr-3 pb-2">
          {!!pass.serviceDescription ? (
            <AppText className="py-2 leading-5 text-white">
              {pass.serviceDescription}
            </AppText>
          ) : null}

          <View className="gap-1 py-3">
            <SectionRow label="Created" value={createdAt} />
            <SectionRow label="Last used" value={updatedAt} />
            <SectionRow label="Expires" value={expiresAt} />
            <SectionRow label="Usage" value={usageText} />
          </View>

          <View className="mt-4 gap-3 flex-row">
            {isArchived ? null : (
              <Pressable
                onPress={onArchive}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 flex-1"
              >
                <AppText className="text-center text-sm font-medium text-white bg-sl">
                  Archive
                </AppText>
              </Pressable>
            )}

            {/* <Pressable
              onPress={onDisconnect}
              className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 flex-1"
            >
              <AppText className="text-center text-sm font-medium text-amber-300">
                Disconnect
              </AppText>
            </Pressable> */}

            <Pressable
              onPress={onDelete}
              className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 flex-1"
            >
              <AppText className="text-center text-sm font-medium text-rose-300">
                Delete
              </AppText>
            </Pressable>
          </View>
        </View>
      ) : null}
    </Pressable>
  );
}
