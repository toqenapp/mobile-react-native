import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  DeviceAccessPass,
  DeviceAccessPassStatus,
} from "@/src/entities/device-access-pass/model/types";

type AccessPassStore = {
  passes: DeviceAccessPass[];

  upsertPass: (pass: DeviceAccessPass) => void;
  archivePass: (id: string) => void;
  restorePass: (id: string) => void;
  syncPassStatuses: () => void;
  deletePass: (id: string) => void;
};

function isPassExpired(pass: DeviceAccessPass): boolean {
  if (!pass.expiresAt) return false;
  return Date.now() >= new Date(pass.expiresAt).getTime();
}

export const useAccessPassStore = create<AccessPassStore>()(
  persist(
    (set) => ({
      passes: [],

      upsertPass: (pass) => {
        set((state) => {
          const index = state.passes.findIndex(
            (p) => p.serviceId === pass.serviceId,
          );

          if (index === -1) {
            return { passes: [pass, ...state.passes] };
          }

          const updated = [...state.passes];
          updated[index] = pass;

          return { passes: updated };
        });
      },

      syncPassStatuses: () => {
        set((state) => ({
          passes: state.passes.map((pass) => {
            if (pass.status !== DeviceAccessPassStatus.Active) {
              return pass;
            }

            if (isPassExpired(pass)) {
              return {
                ...pass,
                status: DeviceAccessPassStatus.Expired,
              };
            }

            if (
              pass.usageLimit !== null &&
              pass.usageCount !== null &&
              pass.usageCount >= pass.usageLimit
            ) {
              return {
                ...pass,
                status: DeviceAccessPassStatus.Used,
              };
            }

            return pass;
          }),
        }));
      },

      deletePass: (id) => {
        set((state) => ({
          passes: state.passes.filter((p) => p.id !== id),
        }));
      },

      archivePass: (id) => {
        set((state) => ({
          passes: state.passes.map((pass) =>
            pass.id === id
              ? {
                  ...pass,
                  status: DeviceAccessPassStatus.Archived,
                  updatedAt: new Date().toISOString(),
                }
              : pass,
          ),
        }));
      },

      restorePass: (id) => {
        set((state) => ({
          passes: state.passes.map((pass) =>
            pass.id === id
              ? {
                  ...pass,
                  status: DeviceAccessPassStatus.Active,
                  updatedAt: new Date().toISOString(),
                }
              : pass,
          ),
        }));
      },
    }),
    {
      name: "toqen-access-pass-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        passes: state.passes,
      }),
    },
  ),
);
