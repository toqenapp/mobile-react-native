import { useServicesStore } from "@/src/store/servicesStore";
import { useEffect } from "react";
import { AppState } from "react-native";

export function useServicesBootstrap() {
  const hydrateFromDb = useServicesStore((state) => state.hydrateFromDb);
  const refreshInBackground = useServicesStore(
    (state) => state.refreshInBackground,
  );

  useEffect(() => {
    void hydrateFromDb().then(() => {
      void refreshInBackground(false);
    });
  }, [hydrateFromDb, refreshInBackground]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void refreshInBackground(false);
      }
    });

    return () => {
      sub.remove();
    };
  }, [refreshInBackground]);
}
