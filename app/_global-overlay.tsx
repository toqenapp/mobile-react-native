import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";
import { Linking, Modal, View } from "react-native";

import { BIOMETRIC_MODAL_SHOWN_KEY } from "@/src/features/security/hooks/useAppLockBootstrap";
import { useUnlock } from "@/src/features/security/hooks/useUnlock";
import { canUseLocalAuth } from "@/src/features/security/lib/localAuth";
import { AppButton, ButtonStyle } from "@/src/shared/ui/AppButton";
import { AppText } from "@/src/shared/ui/AppText";
import { SeparatorLoader } from "@/src/shared/ui/SeparatorLoader";
import { ToqenLogo } from "@/src/shared/ui/ToqenLogo";
import { LockedType, useSecurityStore } from "@/src/store/securityStore";

export default function GlobalOverlay() {
  const isLockedType = useSecurityStore((s) => s.isLockedType);
  const pendingBiometricModal = useSecurityStore(
    (s) => s.pendingBiometricModal,
  );
  const setPendingBiometricModal = useSecurityStore(
    (s) => s.setPendingBiometricModal,
  );
  const setLockedType = useSecurityStore((s) => s.setLockedType);
  const setLastUnlockAt = useSecurityStore((s) => s.setLastUnlockAt);

  const { unlock } = useUnlock();

  const handleBiometricModalConfirm = useCallback(async () => {
    await AsyncStorage.setItem(BIOMETRIC_MODAL_SHOWN_KEY, "1");
    setPendingBiometricModal(false);

    const canUse = await canUseLocalAuth();

    if (canUse) {
      setLockedType(LockedType.Logo);
      void unlock("Unlock Toqen.app");
    } else {
      setLockedType(LockedType.BiometricDenied);
      setLastUnlockAt(null);
    }
  }, [setPendingBiometricModal, setLockedType, setLastUnlockAt, unlock]);

  const handleOpenSettings = useCallback(() => {
    void Linking.openSettings();
  }, []);

  const isTransparentType = isLockedType === LockedType.Transparent;
  const isTransparentAndLoader =
    isLockedType === LockedType.TransparentAndLoader;
  const isLogoAndUnlockBtnType = isLockedType === LockedType.LogoAndUnlockBtn;
  const isLogoType = isLockedType === LockedType.Logo;
  const isBiometricDenied = isLockedType === LockedType.BiometricDenied;

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

  if (isBiometricDenied) {
    return (
      <View
        className="absolute inset-0 z-50 bg-[#0B1020] flex items-center py-28 px-8"
        pointerEvents="auto"
      >
        <View className="flex items-center justify-center gap-5">
          <ToqenLogo />
          <AppText className="text-3xl text-gray-50 font-bold">
            Toqen.app
          </AppText>
        </View>

        <View className="flex-1 justify-center gap-6 w-full">
          <AppText className="text-xl text-gray-50 font-semibold text-center">
            Biometric access required
          </AppText>
          <AppText className="text-base text-gray-400 text-center leading-6">
            Toqen.app uses Face ID or Touch ID to access the secure key storage
            on your device. The private key itself contains no biometric
            information. Your biometric data is never stored, saved, or
            transmitted anywhere.
          </AppText>
          <AppText className="text-base text-gray-400 text-center leading-6">
            To continue, please enable Face ID or Touch ID for Toqen.app in your
            device settings.
          </AppText>
        </View>

        <AppButton
          className="mt-5"
          styleType={ButtonStyle.WHITE}
          onPress={handleOpenSettings}
        >
          Open Settings
        </AppButton>
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

        <Modal
          transparent
          animationType="fade"
          visible={pendingBiometricModal}
          statusBarTranslucent
        >
          <View className="flex-1 items-center justify-center bg-black/65 px-6">
            <View className="w-full max-w-sm rounded-[18px] border border-white/10 bg-slate-950 px-5 py-5">
              <AppText className="text-xl font-bold text-white">
                Protect your Toqen.app access
              </AppText>

              <AppText className="mt-4 text-sm leading-6 text-zinc-300">
                Toqen.app uses Face ID or Touch ID to protect your device key.
                {"\n\n"}
                This key stays on your device and is used to confirm access
                requests.
                {"\n\n"}
                Toqen.app does not collect, store, or send your biometric data.
                Biometrics only unlock access to the protected key on this
                device.
              </AppText>

              <AppButton
                className="mt-5"
                styleType={ButtonStyle.WHITE}
                onPress={() => void handleBiometricModalConfirm()}
              >
                Got it
              </AppButton>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}
