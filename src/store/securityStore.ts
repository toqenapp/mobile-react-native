import { create } from "zustand";

export enum LockedType {
  Transparent = "Transparent",
  TransparentAndLoader = "TransparentAndLoader",
  Logo = "Logo",
  LogoAndUnlockBtn = "LogoAndUnlockBtn",
  BiometricDenied = "BiometricDenied",
}

type SecuritySettings = {
  lockOnLaunch: boolean;
  lockOnResume: boolean;
};

type SecurityState = {
  isLockedType?: LockedType;
  lastUnlockAt: number | null;
  settings: SecuritySettings;
  pendingBiometricModal: boolean;

  setLockedType: (value?: LockedType) => void;
  setLastUnlockAt: (value: number | null) => void;
  patchSettings: (patch: Partial<SecuritySettings>) => void;
  setPendingBiometricModal: (value: boolean) => void;
};

export const useSecurityStore = create<SecurityState>((set) => ({
  isLockedType: LockedType.Logo,
  lastUnlockAt: null,
  pendingBiometricModal: false,

  settings: {
    lockOnLaunch: true,
    lockOnResume: true,
  },

  setLockedType: (value) => set({ isLockedType: value }),
  setLastUnlockAt: (value: number | null) => set({ lastUnlockAt: value }),
  patchSettings: (patch) =>
    set((state) => ({
      settings: {
        ...state.settings,
        ...patch,
      },
    })),
  setPendingBiometricModal: (value) => set({ pendingBiometricModal: value }),
}));
