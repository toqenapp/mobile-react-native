import { Entypo, Feather, Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { Linking, Pressable, ScrollView, View } from "react-native";

import { AppText } from "@/src/shared/ui/AppText";
import { BackButton } from "@/src/shared/ui/BackButton";
import { Header } from "@/src/shared/ui/Header";
import { Screen } from "@/src/shared/ui/Screen";
import { SettingsIcon } from "@/src/shared/ui/SettingsIcon";
import { TabFadeScaleIn } from "@/src/shared/ui/TabFadeScaleIn";
import { LockedType, useSecurityStore } from "@/src/store/securityStore";
import { router } from "expo-router";
import { useCallback } from "react";

const APP_VERSION = Constants.expoConfig?.version;

const EXTRA = Constants.expoConfig?.extra;
const APP_BUILD = EXTRA?.build;
const GIT_COMMIT_HASH = EXTRA?.gitCommitHash;
const GIT_TAG = EXTRA?.gitTag;
const BUILD_URL = EXTRA?.workflowUrl;

const LINKS = {
  privacyPolicy: "https://toqen.app/legal-app/privacy-policy",
  termsOfUse: "https://toqen.app/legal-app/terms-of-use",
  cameraAndQr: "https://toqen.app/legal-app/camera-and-qr-policy",
  security: "https://toqen.app/legal-app/security-and-data-handling",
};

const useOpenUrl = ({
  link,
  external,
}: {
  link?: string;
  external?: boolean;
}) => {
  const setLockedType = useSecurityStore((s) => s.setLockedType);

  const onPress = useCallback(async () => {
    if (!link) return null;
    setLockedType(LockedType.TransparentAndLoader);
    try {
      if (external) {
        await Linking.canOpenURL(link);
      } else {
        await WebBrowser.openBrowserAsync(link);
      }
    } catch {
      //
    } finally {
      setLockedType();
    }
  }, [link, external, setLockedType]);

  if (!link) return null;

  return onPress;
};

function SettingsSingleRow({
  icon,
  title,
  subtitle,
  link,
  external = false,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  link: string;
  external?: boolean;
}) {
  const onPress = useOpenUrl({ link, external });

  const content = (
    <View className="flex-row items-center rounded-[18px] bg-slate-800/50 px-4 py-3">
      {icon ? (
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white/5">
          <SettingsIcon familyIcon="ionicons" nameIcon={icon} size={18} />
        </View>
      ) : null}

      <View className="flex-1">
        <AppText className="text-white">{title}</AppText>

        {subtitle ? (
          <AppText className="mt-1 text-xs text-zinc-400">{subtitle}</AppText>
        ) : null}
      </View>

      {external ? (
        <Feather name="external-link" size={18} color="#71717a" />
      ) : null}
    </View>
  );

  return <Pressable onPress={onPress}>{content}</Pressable>;
}

function SettingsRow({
  familyIcon,
  nameIcon,
  title,
  value,
  link,
  external = false,
}: {
  familyIcon: any;
  nameIcon: any;
  title: string;
  value?: string;
  subtitle?: string;
  link?: string;
  external?: boolean;
}) {
  const onPress = useOpenUrl({ link, external });
  const hasLink = !!link;

  const content = (
    <View className="flex-row items-center">
      <View
        className={`${hasLink ? "" : "rounded-full bg-white/5 h-8 w-8"} mr-3 items-center justify-center `}
      >
        <SettingsIcon familyIcon={familyIcon} nameIcon={nameIcon} />
      </View>

      <AppText className="text-white/90 mr-3">{title}</AppText>

      {value ? <AppText className=" text-zinc-400">{value}</AppText> : null}

      {hasLink && external ? (
        <Feather name="external-link" size={18} color="#71717a" />
      ) : null}
    </View>
  );

  if (hasLink) {
    return (
      <Pressable
        className="self-start rounded-full bg-slate-800/50 p-4 "
        onPress={onPress}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

function SettingsListRow({ text }: { text: string }) {
  return (
    <View className="items-center flex-row gap-1">
      <Entypo name="dot-single" size={13} color="#71717a" />
      <AppText className="text-white/80 text-sm ">{text}</AppText>
    </View>
  );
}

function SettingsLinkIconRow({
  familyIcon,
  nameIcon,
  title,
  link,
}: {
  familyIcon: any;
  nameIcon: any;
  title: string;
  link?: string;
}) {
  const onPress = useOpenUrl({ link });

  const content = (
    <View className="items-center flex gap-1.5 max-w-28 justify-center rounded-xl bg-slate-800/60 p-4 flex-1">
      <View className="rounded-full bg-white/5 items-center justify-center">
        <SettingsIcon familyIcon={familyIcon} nameIcon={nameIcon} size={40} />
      </View>
      <AppText className="text-white/70 text-xxs font-bold text-center">
        {title}
      </AppText>
    </View>
  );

  return <Pressable onPress={onPress}>{content}</Pressable>;
}

export default function SettingsScreen() {
  return (
    <Screen withTopInset withBottomInset>
      <TabFadeScaleIn>
        <Header
          paddingHorizontal={0}
          paddingTop={15}
          paddingBottom={0}
          title="Settings"
          height={55}
          right={<View className="w-14" />}
          left={<BackButton onPress={() => router.back()} />}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <View className="px-4 pt-6">
            <AppText className="px-2 mb-3 text-xs uppercase tracking-[1px] text-zinc-500">
              Security & Transparency
            </AppText>

            <View className="rounded-[18px] border border-white/10 bg-slate-950/85 px-4 py-4 flex gap-1.5 w-full">
              <View className="flex-row mb-2 gap-3 justify-center">
                <SettingsLinkIconRow
                  familyIcon="materialCommunityIcons"
                  nameIcon="open-source-initiative"
                  title="Open source"
                  link="https://github.com/toqenapp/mobile-react-native"
                />

                <SettingsLinkIconRow
                  familyIcon="ionicons"
                  nameIcon="shield-outline"
                  title="Security model"
                  link="https://toqen.app/security"
                />

                <SettingsLinkIconRow
                  familyIcon="feather"
                  nameIcon="message-circle"
                  title="Report issue"
                  link="https://toqen.app/security#report"
                />
              </View>

              <AppText className="text-sm text-white/80 px-2.5 pb-3">
                All access requests require explicit user approval and
                device-based cryptographic verification
              </AppText>

              <SettingsListRow text="Open source mobile client" />
              <SettingsListRow text="Public security model" />
              <SettingsListRow text="Access-first authentication architecture" />
              <SettingsListRow text="Device-bound cryptographic authorization" />
              <SettingsListRow text="Short-lived, single-use requests" />
              <SettingsListRow text="Secure key storage" />
              <SettingsListRow text="Responsible disclosure programs" />
            </View>
          </View>

          <View className="px-6 pt-4">
            <AppText className="px-2  mb-3 text-xs uppercase tracking-[1px] text-zinc-500">
              Policies
            </AppText>

            <View className="gap-2">
              <SettingsSingleRow
                icon="document-text-outline"
                title="Privacy Policy"
                subtitle="How Toqen.app processes data"
                link={LINKS.privacyPolicy}
              />

              <SettingsSingleRow
                icon="camera-outline"
                title="Camera & QR Policy"
                subtitle="How camera and QR scanning are used"
                link={LINKS.cameraAndQr}
              />

              <SettingsSingleRow
                icon="lock-closed-outline"
                title="Security & Data"
                subtitle="How data is protected and stored"
                link={LINKS.security}
              />

              <SettingsSingleRow
                icon="shield-checkmark-outline"
                title="Terms of Use"
                subtitle="Rules for using Toqen.app"
                link={LINKS.termsOfUse}
              />
            </View>
          </View>

          <View className="px-4 pt-6">
            <AppText className="px-2 mb-3 text-xs uppercase tracking-[1px] text-zinc-500">
              App Info
            </AppText>

            <View className="rounded-[18px] border border-white/10 bg-slate-950/85 px-4 py-4 flex gap-1 w-full">
              {BUILD_URL ? (
                <SettingsRow
                  familyIcon="antDesign"
                  nameIcon="github"
                  title="Workflow"
                  link={BUILD_URL}
                />
              ) : null}

              <SettingsRow
                familyIcon="ionicons"
                nameIcon="cube-outline"
                title="Version"
                value={APP_VERSION}
              />

              <SettingsRow
                familyIcon="ionicons"
                nameIcon="build-outline"
                title="Build"
                value={APP_BUILD}
              />

              <SettingsRow
                familyIcon="ionicons"
                nameIcon="pricetag-outline"
                title="Release Tag"
                value={GIT_TAG}
              />

              <SettingsRow
                familyIcon="ionicons"
                nameIcon="git-branch-outline"
                title="Commit"
                value={GIT_COMMIT_HASH}
              />
            </View>
          </View>
        </ScrollView>
      </TabFadeScaleIn>
    </Screen>
  );
}
