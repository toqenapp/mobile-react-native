import { create } from "zustand";

import { api } from "@/src/api";
import {
  applyServicesDelta,
  getServicesCount,
  getServicesMeta,
  initServicesDb,
  setLastVersionCheckAt,
  setServicesVersion,
} from "@/src/db/services/servicesDb";

const VERSION_CHECK_TTL_MS = 10 * 60 * 1000;

type ServicesStore = {
  version: number;
  lastCheckAt: number | null;
  totalCount: number;

  isHydrated: boolean;
  isRefreshing: boolean;
  error: string | null;

  hydrateFromDb: () => Promise<void>;
  refreshInBackground: (force?: boolean) => Promise<void>;
  refreshNow: () => Promise<void>;
};

export const useServicesStore = create<ServicesStore>((set, get) => ({
  version: 0,
  lastCheckAt: null,
  totalCount: 0,

  isHydrated: false,
  isRefreshing: false,
  error: null,

  hydrateFromDb: async () => {
    try {
      await initServicesDb();

      const meta = await getServicesMeta();

      set({
        version: meta.version,
        lastCheckAt: meta.lastCheckAt,
        totalCount: meta.totalCount,
        isHydrated: true,
        error: null,
      });
    } catch (error) {
      set({
        isHydrated: true,
        error:
          error instanceof Error ? error.message : "Failed to hydrate services",
      });
    }
  },

  refreshInBackground: async (force = false) => {
    const state = get();
    if (state.isRefreshing) return;

    const now = Date.now();

    if (
      !force &&
      state.lastCheckAt &&
      now - state.lastCheckAt < VERSION_CHECK_TTL_MS
    ) {
      return;
    }

    set({ isRefreshing: true, error: null });

    try {
      await setLastVersionCheckAt(now);

      let nextCursor: string | null = null;
      let nextVersion = state.version;
      let hasMore = true;
      let anyChanges = false;

      while (hasMore) {
        const response = await api.services.sync({
          currentVersion: state.version,
          cursor: nextCursor,
        });

        nextVersion = response.version;
        nextCursor = response.nextCursor;
        hasMore = response.hasMore;
        anyChanges = anyChanges || response.changed;

        if (response.changed) {
          await applyServicesDelta({
            upserts: response.upserts,
            deletes: response.deletes,
          });
        } else {
          hasMore = false;
        }
      }

      if (anyChanges) {
        await setServicesVersion(nextVersion);
      }

      const totalCount = await getServicesCount();

      set({
        version: nextVersion,
        lastCheckAt: now,
        totalCount,
        isRefreshing: false,
        error: null,
      });
    } catch (error) {
      set({
        lastCheckAt: now,
        isRefreshing: false,
        error:
          error instanceof Error ? error.message : "Failed to refresh services",
      });
    }
  },

  refreshNow: async () => {
    await get().refreshInBackground(true);
  },
}));
