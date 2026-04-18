import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

import { api } from "@/src/api";
import { AuthSession } from "@/src/entities/auth/model/types";
import { useLocalService } from "@/src/features/services/hooks/useLocalService";
import { deviceKey } from "@/src/providers/device-key";
import { isExpired } from "@/src/shared/lib/requestGuards";

import { useAccessPassStore } from "@/src/store/accessPassStore";
import { useAuthSessionStore } from "@/src/store/authSessionStore";

import * as Haptics from "expo-haptics";
import { View } from "react-native";

import { Approved } from "@/src/entities/common";
import { ServiceItem } from "@/src/entities/service/model/types";
import { AppButton, ButtonStyle } from "@/src/shared/ui/AppButton";
import { AppText } from "@/src/shared/ui/AppText";
import { BackButton } from "@/src/shared/ui/BackButton";
import { Card } from "@/src/shared/ui/Card";
import { Header } from "@/src/shared/ui/Header";
import { Screen } from "@/src/shared/ui/Screen";
import { ServiceAvatar } from "@/src/shared/ui/ServiceAvatar";

type Props = {
  session: AuthSession;
};

function ConfirmScreenInner({ session }: Props) {
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<Approved | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [serviceItem, setServiceItem] = useState<Partial<ServiceItem> | null>(
    null,
  );

  const submitInFlightRef = useRef(false);

  const upsertPass = useAccessPassStore((s) => s.upsertPass);
  const clearSession = useAuthSessionStore((s) => s.clearSession);

  const { requestId, challenge, nonce, expiresAtMs } = session;
  const { getLocalService } = useLocalService();

  const isApprovedYes = submitting === Approved.YES;
  const isApprovedNo = submitting === Approved.NO;

  const logoUrl = serviceItem?.logoUrl;
  const serviceName = serviceItem?.name;
  const brandColor = serviceItem?.brandColor;
  const description = serviceItem?.description;

  useEffect(() => {
    const update = () => {
      const diffMs = expiresAtMs - Date.now();
      setTimeLeft(Math.max(0, Math.ceil(diffMs / 1000)));
    };

    update();

    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAtMs]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 130);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    (async function () {
      const res = await getLocalService(session.clientId);
      setServiceItem(res);
    })();
  }, [getLocalService, session.clientId]);

  const expired = isExpired(expiresAtMs);

  const finishAndGoHome = useCallback(() => {
    submitInFlightRef.current = false;
    clearSession();
    setSubmitting(null);
    router.replace("/");
  }, [clearSession]);

  const handleBackHome = useCallback(() => {
    finishAndGoHome();
  }, [finishAndGoHome]);

  const handleConfirm = useCallback(
    async (approved: Approved) => {
      if (submitInFlightRef.current) return;
      submitInFlightRef.current = true;

      setResultMessage(null);

      if (expired) {
        setResultMessage("Request expired");
        submitInFlightRef.current = false;
        return;
      }

      try {
        if (!requestId || !nonce) {
          setResultMessage("Invalid verify payload");
          submitInFlightRef.current = false;
          return;
        }

        setSubmitting(approved);

        const publicKey = await deviceKey.getPublicKey();

        if (!publicKey) {
          setResultMessage("DeviceKeyPair failed");
          setSubmitting(null);
          submitInFlightRef.current = false;
          return;
        }

        const appInstanceId = await deviceKey.getOrCreateAppInstanceId();

        if (approved === Approved.NO) {
          await api.auth.confirm({
            requestId,
            nonce,
            publicKey,
            appInstanceId,
            challengeSignature: "",
            approved: Approved.NO,
          });

          finishAndGoHome();
          return;
        }

        if (!challenge) {
          setResultMessage("Invalid verify payload");
          setSubmitting(null);
          submitInFlightRef.current = false;
          return;
        }

        const challengeSignature = await deviceKey.signPairWithAuth(challenge);

        if (!challengeSignature) {
          setResultMessage("DeviceKeyPair failed");
          setSubmitting(null);
          submitInFlightRef.current = false;
          return;
        }

        const response = await api.auth.confirm({
          requestId,
          nonce,
          publicKey,
          appInstanceId,
          challengeSignature,
          approved: Approved.YES,
        });

        if (!response.accessGranted || !response.deviceAccessPass) {
          setResultMessage("Verification failed");
          setSubmitting(null);
          submitInFlightRef.current = false;
          return;
        }

        const pass = response.deviceAccessPass;

        upsertPass({
          id: pass.id,
          serviceId: pass.serviceId,
          serviceName: pass.serviceName,
          serviceIcon: pass.serviceIcon,
          usageLimit: pass.usageLimit,
          usageCount: pass.usageCount,
          expiresAt: pass.expiresAt,
          createdAt: pass.createdAt,
          updatedAt: pass.updatedAt,
          revokedAt: pass.revokedAt,
          status: pass.status,
        });

        finishAndGoHome();
      } catch (error) {
        console.error("CONFIRM_FAILED", error);
        setResultMessage("Verification failed");
        setSubmitting(null);
        submitInFlightRef.current = false;
      }
    },
    [challenge, expired, nonce, requestId, finishAndGoHome, upsertPass],
  );

  if (expired) {
    return (
      <Screen>
        <Header title="Request expired" />
        <View className="px-8 mt-4">
          <Card>
            <AppText>This login request has expired.</AppText>
          </Card>

          <View className="mt-4">
            <AppButton
              title="Go to my hub"
              styleType={ButtonStyle.BLACK}
              onPress={handleBackHome}
            />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen withBottomInset>
      <Header
        title="Confirm Access"
        left={<BackButton onPress={() => router.replace("/")} />}
      />

      <View className="flex-1 items-center justify-center px-8 py-4">
        <Card className="items-center justify-center px-11 pt-12 pb-8">
          <ServiceAvatar
            name={serviceName}
            logoUrl={logoUrl}
            size={80}
            brandColor={brandColor}
          />

          <AppText className="text-3xl mt-6 font-extrabold tracking-wider text-slate-100">
            {serviceName}
          </AppText>

          <AppText className="mt-2 text-center text-slate-400 ">
            {description}
          </AppText>
        </Card>

        <AppText className=" mt-8 text-center text-xl text-slate-400">
          You are signing in to this service
          <br />
          Your device will cryptographically verify this request before access
          is granted
        </AppText>

        <AppText className="mt-4 mb-auto text-lg text-slate-400">
          Expires in{" "}
          <AppText className="text-3xl font-bold tracking-widest text-slate-100">
            {timeLeft}
          </AppText>
          s
        </AppText>
      </View>

      <View className="px-4 pb-4">
        <View className="flex-row gap-3">
          <View style={{ width: 89 }}>
            <AppButton
              title="✕"
              loadingText=""
              onPress={() => void handleConfirm(Approved.NO)}
              disabled={isApprovedYes || submitInFlightRef.current}
              loading={isApprovedNo}
              styleType={ButtonStyle.GHOST}
            />
          </View>

          <View className="flex-1">
            <AppButton
              loadingText="Signing..."
              title="Confirm"
              onPress={() => void handleConfirm(Approved.YES)}
              disabled={isApprovedNo || submitInFlightRef.current}
              loading={isApprovedYes}
            />
          </View>
        </View>
      </View>

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

export default function ConfirmScreen() {
  const session = useAuthSessionStore((s) => s.session);

  useEffect(() => {
    if (!session) {
      router.replace("/");
    }
  }, [session]);

  if (!session) {
    return null;
  }

  return <ConfirmScreenInner session={session} />;
}
