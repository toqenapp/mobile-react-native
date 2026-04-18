import { create } from "zustand";

export enum LockedType {
  Transparent = "Transparent",
  TransparentAndLoader = "TransparentAndLoader",
  Logo = "Logo",
  LogoAndUnlockBtn = "LogoAndUnlockBtn",
}

type SecuritySettings = {
  lockOnLaunch: boolean;
  lockOnResume: boolean;
};

type SecurityState = {
  isLockedType?: LockedType;
  lastUnlockAt: number | null;
  settings: SecuritySettings;

  setLockedType: (value?: LockedType) => void;
  setLastUnlockAt: (value: number | null) => void;
  patchSettings: (patch: Partial<SecuritySettings>) => void;
};

export const useSecurityStore = create<SecurityState>((set) => ({
  isLockedType: LockedType.Logo,
  lastUnlockAt: null,

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
}));
