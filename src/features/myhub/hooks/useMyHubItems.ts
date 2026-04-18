import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useRef, useState } from "react";

import { listLocalServices } from "@/src/db/services/servicesDb";
import { DeviceAccessPass } from "@/src/entities/device-access-pass/model/types";
import { ServiceItem } from "@/src/entities/service/model/types";
import { useAccessPassStore } from "@/src/store/accessPassStore";
import { useServicesStore } from "@/src/store/servicesStore";

type Params = {
  query?: string;
};

export function useMyHubItems(params: Params = {}) {
  const { query = "" } = params;

  const hydrateFromDb = useServicesStore((s) => s.hydrateFromDb);
  const isHydrated = useServicesStore((s) => s.isHydrated);

  const passes = useAccessPassStore((s) => s.passes);

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFocusedRef = useRef(false);
  const requestIdRef = useRef(0);

  const loadServices = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    try {
      if (!isHydrated) {
        await hydrateFromDb();
      }

      const localServices = await listLocalServices({
        query: "",
        limit: 1000,
        offset: 0,
      });

      if (!isFocusedRef.current || requestId !== requestIdRef.current) {
        return;
      }

      setServices(localServices);
    } catch (err) {
      if (!isFocusedRef.current || requestId !== requestIdRef.current) {
        return;
      }

      setError(
        err instanceof Error ? err.message : "Failed to load local services",
      );
      setServices([]);
    } finally {
      if (isFocusedRef.current && requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [hydrateFromDb, isHydrated]);

  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true;
      void loadServices();

      return () => {
        isFocusedRef.current = false;
      };
    }, [loadServices]),
  );

  const servicesMap = useMemo(() => {
    const map = new Map<string, ServiceItem>();

    for (const service of services) {
      map.set(service.id, service);
    }

    return map;
  }, [services]);

  const items = useMemo<DeviceAccessPass[]>(() => {
    return passes.map((pass) => {
      const service = servicesMap.get(pass.serviceId);

      return {
        ...pass,
        serviceName: service?.name ?? pass.serviceName,
        serviceDescription: service?.description ?? pass.serviceDescription,
        serviceIcon: service?.logoUrl ?? pass.serviceIcon,
        brandColor: service?.brandColor ?? pass.brandColor,
      };
    });
  }, [passes, servicesMap]);

  const myPasses = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return items;
    }

    return items.filter((item) =>
      item.serviceName.toLowerCase().includes(normalized),
    );
  }, [items, query]);

  return {
    myPasses,
    loading,
    error,
    reload: loadServices,
  };
}
