import { Pressable, View } from "react-native";

import {
  DeviceAccessPassStatus,
  PendingStage,
} from "@/src/entities/device-access-pass/model/types";
import { getLabels } from "@/src/shared/lib/getLabels";
import { AppText } from "@/src/shared/ui/AppText";
import { SeparatorLoader } from "@/src/shared/ui/SeparatorLoader";
import { ServiceAvatar } from "@/src/shared/ui/ServiceAvatar";

type Props = {
  name?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  brandColor?: string;

  accessState: DeviceAccessPassStatus;

  loading?: boolean;
  loadingText: PendingStage | null;

  onPress?: () => void;
};

export function ServiceListItem({
  name,
  description,
  logoUrl,
  brandColor,
  accessState,
  loading,
  loadingText,
  onPress,
}: Props) {
  const {
    action: actionLabel,
    status: statusLabel,
    actionColor,
    actionColorService,
  } = getLabels(accessState);
  return (
    <>
      <View className="flex pl-[89px] pr-5">
        <View
          className="w-full h-0.5"
          style={{
            borderBottomWidth: 1,
            borderColor: "#334155",
            borderStyle: "dashed",
            opacity: 0.5,
          }}
        ></View>
      </View>

      <View className="min-h-[92px] flex-row items-center pl-4">
        <ServiceAvatar
          name={name}
          logoUrl={logoUrl}
          size={60}
          brandColor={brandColor}
        />

        <View className="ml-4 flex-1 justify-center">
          <AppText
            numberOfLines={1}
            className="text-xl leading-[22px] font-bold text-gray-50"
          >
            {name || "Unknown service"}
          </AppText>

          {!!description && (
            <AppText numberOfLines={2} className="mt-1 text-gray-500">
              {description}
            </AppText>
          )}
        </View>

        <Pressable
          onPress={onPress}
          className="pl-3 pr-5 flex items-center justify-center h-16 flex-nowrap"
        >
          {loading ? (
            <View className="flex flex-col gap-1">
              <AppText className="text-sm text-gray-300">
                {loadingText || "Loading"}…
              </AppText>
              <SeparatorLoader show={true} maxWidth={65} />
            </View>
          ) : (
            <View className="flex flex-col items-end ">
              <AppText
                className={`text-[17px] font-bold ${actionColorService || actionColor}`}
              >
                {actionLabel}
              </AppText>
              {!!statusLabel ? (
                <AppText className="text-xs text-gray-500 mt-auto text-nowrap">
                  {statusLabel}
                </AppText>
              ) : null}
            </View>
          )}
        </Pressable>
      </View>
    </>
  );
}
