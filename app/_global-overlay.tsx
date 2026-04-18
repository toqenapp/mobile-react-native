import { useUnlock } from "@/src/features/security/hooks/useUnlock";
import { AppButton, ButtonStyle } from "@/src/shared/ui/AppButton";
import { AppText } from "@/src/shared/ui/AppText";
import { SeparatorLoader } from "@/src/shared/ui/SeparatorLoader";
import { ToqenLogo } from "@/src/shared/ui/ToqenLogo";
import { LockedType, useSecurityStore } from "@/src/store/securityStore";
import { View } from "react-native";

export default function GlobalOverlay() {
  const isLockedType = useSecurityStore((s) => s.isLockedType);

  const { unlock } = useUnlock();

  const isTransparentType = isLockedType === LockedType.Transparent;
  const isTransparentAndLoader =
    isLockedType === LockedType.TransparentAndLoader;
  const isLogoAndUnlockBtnType = isLockedType === LockedType.LogoAndUnlockBtn;
  const isLogoType = isLockedType === LockedType.Logo;

  if (isTransparentType) {
    return (
      <View
        className="absolute inset-0 z-50 bg-black/30"
        pointerEvents="auto"
      />
    );
  }

  if (isTransparentAndLoader) {
    return (
      <View className="absolute inset-0 z-50 bg-black/50" pointerEvents="auto">
        <View className="w-1/2 mx-auto items-center h-full gap-6 justify-center">
          <AppText>Opening...</AppText>
          <SeparatorLoader show={true} />
        </View>
      </View>
    );
  }

  if (isLogoAndUnlockBtnType || isLogoType) {
    return (
      <View
        className="absolute inset-0 z-50 bg-[#0B1020] flex items-center py-28"
        pointerEvents="auto"
      >
        <View className="flex items-center justify-center gap-5">
          <ToqenLogo />
          <AppText className="text-3xl text-gray-50 font-bold">
            Toqen.app
          </AppText>
        </View>
        {isLogoAndUnlockBtnType ? (
          <AppButton
            className="mt-auto"
            styleType={ButtonStyle.SECONDARY}
            rounded={8}
            height={55}
            width={121}
            onPress={() => void unlock("Unlock Toqen.app")}
          >
            Unlock
          </AppButton>
        ) : null}
      </View>
    );
  }
}
