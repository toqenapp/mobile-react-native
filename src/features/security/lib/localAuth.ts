import * as LocalAuthentication from "expo-local-authentication";

type LocalAuthAvailability = {
  canAuthenticate: boolean;
  enrolledLevel: LocalAuthentication.SecurityLevel;
  hasBiometricHardware: boolean;
  hasEnrolledBiometrics: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
  requiresDeviceSecuritySetup: boolean;
};

async function getLocalAuthAvailability(): Promise<LocalAuthAvailability> {
  const [
    enrolledLevel,
    hasBiometricHardware,
    hasEnrolledBiometrics,
    supportedTypes,
  ] = await Promise.all([
    LocalAuthentication.getEnrolledLevelAsync(),
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
    LocalAuthentication.supportedAuthenticationTypesAsync(),
  ]);

  const canAuthenticate =
    enrolledLevel === LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG;

  return {
    canAuthenticate,
    enrolledLevel,
    hasBiometricHardware,
    hasEnrolledBiometrics,
    supportedTypes,
    requiresDeviceSecuritySetup: !canAuthenticate,
  };
}

export async function canUseLocalAuth(): Promise<boolean> {
  const availability = await getLocalAuthAvailability();
  return availability.canAuthenticate;
}

type AuthenticateOptions = {
  promptMessage: string;
  promptSubtitle?: string;
  promptDescription?: string;
};

export async function authenticateLocal({
  promptMessage,
  promptSubtitle,
  promptDescription,
}: AuthenticateOptions): Promise<boolean> {
  const availability = await getLocalAuthAvailability();

  if (!availability.canAuthenticate) {
    return false;
  }

  // Sensitive local auth must use strong biometrics only.
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    promptSubtitle,
    promptDescription,
    cancelLabel: "Cancel",
    disableDeviceFallback: true,
    requireConfirmation: true,
  });

  return result.success === true;
}
