import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { PermissionStatus, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  Linking,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";

import { api } from "@/src/api";
import { CameraBlock } from "@/src/features/scan/ui/CameraBlock";
import { ManualCodeCard } from "@/src/features/scan/ui/ManualCodeCard";
import { useKeyboardHeight } from "@/src/hooks/useKeyboardHeight";
import { deviceKey } from "@/src/providers/device-key";
import { parseToqenQR } from "@/src/shared/lib/parseToqenQR";
import {
  isExpired,
  normalizeExpiresAtMs,
} from "@/src/shared/lib/requestGuards";
import { AppButton, ButtonStyle } from "@/src/shared/ui/AppButton";
import { AppText } from "@/src/shared/ui/AppText";
import { Card } from "@/src/shared/ui/Card";
import { Screen } from "@/src/shared/ui/Screen";
import { useAuthSessionStore } from "@/src/store/authSessionStore";
import { LockedType, useSecurityStore } from "@/src/store/securityStore";

type LastScanned = {
  value: string;
  ts: number;
};

enum TypeEnter {
  BARCODE = "barcode",
  MANUAL = "manual",
}

const MANUAL_CODE_LENGTH = 6;
const FOOTER_BOTTOM_GAP = 16;

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [entering, setEntering] = useState<TypeEnter | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [manualCode, setManualCode] = useState("");

  const keyboardHeight = useKeyboardHeight();
  const isManualMode = keyboardHeight > 0;

  const hiddenInputRef = useRef<TextInput>(null);
  const lastScannedRef = useRef<LastScanned | null>(null);
  const lastAutoSubmittedCodeRef = useRef<string | null>(null);

  const setSession = useAuthSessionStore((s) => s.setSession);

  const setLockedType = useSecurityStore((s) => s.setLockedType);

  useFocusEffect(
    useCallback(() => {
      setEntering(null);
      setIsFocused(true);
      lastScannedRef.current = null;
      lastAutoSubmittedCodeRef.current = null;

      return () => {
        setEntering(null);
        setIsFocused(false);
        lastScannedRef.current = null;
        lastAutoSubmittedCodeRef.current = null;
      };
    }, []),
  );

  const isBarcodeEntering = entering === TypeEnter.BARCODE;
  const isManualEntering = entering === TypeEnter.MANUAL;
  const isEntering = isBarcodeEntering || isManualEntering;

  const isGranted = permission?.granted === true;
  const isDenied = permission?.status === PermissionStatus.DENIED;

  const hideKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const goBack = useCallback(() => {
    router.push("/");
  }, []);

  const vibrateSuccess = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  }, []);

  const showError = useCallback((title: string, message: string) => {
    Alert.alert(title, message, [{ text: "OK" }]);
  }, []);

  const focusManualInput = useCallback(() => {
    hiddenInputRef.current?.focus();
  }, []);

  const handleOpenSettings = useCallback(() => {
    void Linking.openSettings();
  }, []);

  const handleRequestCameraPermission = useCallback(async () => {
    if (isGranted || isDenied) return;
    await requestPermission();
  }, [isGranted, isDenied, requestPermission]);

  const handleBarcodeScanned = useCallback(
    async ({ data }: { data: string }) => {
      if (!isFocused || entering || isManualMode) return;

      const now = Date.now();
      const last = lastScannedRef.current;

      if (last && last.value === data && now - last.ts < 1500) {
        return;
      }

      lastScannedRef.current = { value: data, ts: now };
      setEntering(TypeEnter.BARCODE);

      try {
        const parsed = parseToqenQR(data);

        if (!parsed) {
          showError("Invalid QR", "QR format is not valid for Toqen.");
          return;
        }

        if (parsed.expiresAtMs && isExpired(parsed.expiresAtMs)) {
          showError("Expired QR", "This login request has already expired.");
          return;
        }

        const publicKey = await deviceKey.getPublicKey();

        if (!publicKey) {
          showError("Error", "DeviceKeyPair failed");
          return;
        }

        const appInstanceId = await deviceKey.getOrCreateAppInstanceId();

        const response = await api.auth.scanned({
          requestId: parsed.requestId,
          nonce: parsed.nonce,
          publicKey,
          appInstanceId,
        });

        void vibrateSuccess();
        const expiresAtMs = normalizeExpiresAtMs(response.expires);

        if (!expiresAtMs) {
          showError("Error", "Invalid request expiration");
          return;
        }

        setSession({
          requestId: response.requestId,
          clientId: response.clientId,
          projectId: response.projectId,
          nonce: parsed.nonce,
          expiresAtMs,
          service: response.service,
          challenge: response.challenge,
          location: response.location,
        });
        router.push("/confirm");
      } catch (error) {
        console.error("QR_SCANNED_FAILED", error);
        showError("Error", "Could not process this QR code.");
      } finally {
        setEntering(null);
      }
    },
    [entering, isFocused, isManualMode, setSession, showError, vibrateSuccess],
  );

  const handleManualCodeChange = useCallback((value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, MANUAL_CODE_LENGTH);

    setManualCode((prev) => {
      if (prev !== digits) {
        lastAutoSubmittedCodeRef.current = null;
      }

      return digits;
    });
  }, []);

  const handleManual = useCallback(async () => {
    if (entering) return;
    if (!isManualMode) return;

    if (manualCode.length !== MANUAL_CODE_LENGTH) {
      showError("Invalid code", `Enter the ${MANUAL_CODE_LENGTH}-digit code.`);
      return;
    }

    try {
      setEntering(TypeEnter.MANUAL);

      const publicKey = await deviceKey.getPublicKey();

      if (!publicKey) {
        showError("Error", "DeviceKeyPair failed");
        return;
      }

      const appInstanceId = await deviceKey.getOrCreateAppInstanceId();

      const response = await api.auth.manualCode({
        manualCode,
        publicKey,
        appInstanceId,
      });

      void vibrateSuccess();
      const expiresAtMs = normalizeExpiresAtMs(response.expires);

      if (!expiresAtMs) {
        showError("Error", "Invalid request expiration");
        return;
      }

      setSession({
        requestId: response.requestId,
        clientId: response.clientId,
        projectId: response.projectId,
        nonce: response.nonce,
        expiresAtMs,
        service: response.service,
        challenge: response.challenge,
        location: response.location,
      });
      router.push("/confirm");
    } catch (error) {
      console.error("MANUAL_CODE_SUBMIT_FAILED", error);
      showError("Error", "Could not apply this code.");
    } finally {
      setEntering(null);
    }
  }, [
    entering,
    manualCode,
    isManualMode,
    setSession,
    showError,
    vibrateSuccess,
  ]);

  const handleManualSubmit = useCallback(async () => {
    if (entering) return;
    if (!isManualMode) return;

    if (manualCode.length !== MANUAL_CODE_LENGTH) {
      showError("Invalid code", `Enter the ${MANUAL_CODE_LENGTH}-digit code.`);
      return;
    }

    try {
      setEntering(TypeEnter.MANUAL);

      const publicKey = await deviceKey.getPublicKey();

      if (!publicKey) {
        showError("Error", "DeviceKeyPair failed");
        return;
      }

      const appInstanceId = await deviceKey.getOrCreateAppInstanceId();

      const response = await api.auth.manualCode({
        manualCode,
        publicKey,
        appInstanceId,
      });

      void vibrateSuccess();
      const expiresAtMs = normalizeExpiresAtMs(response.expires);

      if (!expiresAtMs) {
        showError("Error", "Invalid request expiration");
        return;
      }

      setSession({
        requestId: response.requestId,
        clientId: response.clientId,
        projectId: response.projectId,
        nonce: response.nonce,
        expiresAtMs,
        service: response.service,
        challenge: response.challenge,
        location: response.location,
      });
      router.push("/confirm");
    } catch (error) {
      console.error("MANUAL_CODE_SUBMIT_FAILED", error);
      showError("Error", "Could not apply this code.");
    } finally {
      setEntering(null);
    }
  }, [
    entering,
    manualCode,
    isManualMode,
    setSession,
    showError,
    vibrateSuccess,
  ]);

  useEffect(() => {
    if (manualCode.length !== MANUAL_CODE_LENGTH) return;
    if (entering) return;
    if (lastAutoSubmittedCodeRef.current === manualCode) return;

    lastAutoSubmittedCodeRef.current = manualCode;
    void handleManual();
  }, [handleManual, entering, manualCode]);

  const isIos = Platform.OS === "ios";
  const footerBottom = isManualMode
    ? keyboardHeight + (isIos ? 0 : 30)
    : FOOTER_BOTTOM_GAP;

  useEffect(() => {
    setLockedType(isEntering ? LockedType.Transparent : undefined);
    return () => setLockedType();
  }, [isEntering, setLockedType]);

  const renderCamera = isGranted && isFocused && !isManualMode;

  return (
    <Screen>
      <View className="flex-1">
        <Pressable
          onPress={goBack}
          className="absolute left-5 top-3 z-20 h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(17,17,17,0.72)" }}
        >
          <Feather name="x" size={22} color="#FFFFFF" />
        </Pressable>

        <Pressable className="flex-1" onPress={hideKeyboard}>
          <View className="flex-1">
            {!isManualMode && !isGranted && !isDenied ? (
              <View className="flex-1 items-center justify-center px-8">
                <Card className="items-center">
                  <AppText>
                    To scan a QR code, Toqen.app needs access to your camera.
                  </AppText>
                </Card>

                <View className="mt-6 flex-row">
                  <AppButton
                    title="Continue"
                    className="max-w-60 w-full"
                    styleType={ButtonStyle.WHITE}
                    onPress={() => void handleRequestCameraPermission()}
                  />
                </View>
              </View>
            ) : null}

            {!isManualMode && isDenied ? (
              <View className="flex-1 items-center justify-center px-8">
                <Card>
                  <AppText>
                    Camera access is disabled. You can enable it in Settings to
                    scan QR codes, or enter the code manually.
                  </AppText>
                </Card>

                <View className="mt-4 w-full gap-3 flex-row">
                  <AppButton
                    title="Open Settings"
                    className="flex-1"
                    styleType={ButtonStyle.BLACK}
                    onPress={handleOpenSettings}
                  />

                  <AppButton
                    title="Enter Code"
                    className="flex-1"
                    styleType={ButtonStyle.WHITE}
                    onPress={focusManualInput}
                  />
                </View>
              </View>
            ) : null}

            {!isManualMode && isGranted ? (
              <CameraBlock
                renderCamera={renderCamera}
                locked={isBarcodeEntering}
                onBarcodeScanned={handleBarcodeScanned}
              />
            ) : null}

            {isManualMode ? (
              <Pressable
                onPress={hideKeyboard}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.5,
                  maxHeight: footerBottom,
                }}
              >
                <View
                  className="h-20 w-20 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.12)",
                  }}
                >
                  <Feather name="camera" size={32} color="#2DD4BF" />
                </View>
              </Pressable>
            ) : null}
          </View>

          <View
            className="flex items-center"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: footerBottom,
            }}
          >
            <AppText
              className={`p-3 text-center ${isManualMode ? "text-gray-500" : "text-gray-300"}`}
            >
              Scan a QR code or enter it manually
            </AppText>
            <View className="px-5 max-w-sm">
              <ManualCodeCard
                inputRef={hiddenInputRef}
                manualCode={manualCode}
                codeLength={MANUAL_CODE_LENGTH}
                isKeyboardVisible={isManualMode}
                locked={isManualEntering}
                onChangeText={handleManualCodeChange}
                onSubmit={handleManualSubmit}
              />
            </View>
          </View>
        </Pressable>
      </View>
    </Screen>
  );
}
