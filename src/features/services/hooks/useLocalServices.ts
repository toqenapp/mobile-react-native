import { useCallback, useEffect, useMemo, useState } from "react";

import { listLocalServices } from "@/src/db/services/servicesDb";
import { DeviceAccessPass } from "@/src/entities/device-access-pass/model/types";
import {
  ServiceItem,
  ServiceWithAccess,
} from "@/src/entities/service/model/types";
import { useAccessPassStore } from "@/src/store/accessPassStore";
import { useServicesStore } from "@/src/store/servicesStore";

type UseLocalServicesParams = {
  query?: string;
  limit?: number;
};

export function useLocalServices(params: UseLocalServicesParams = {}) {
  const { query = "", limit = Infinity } = params;

  const refreshNow = useServicesStore((state) => state.refreshNow);
  const passes = useAccessPassStore((s) => s.passes);

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextItems = await listLocalServices({
        query,
        limit,
        offset: 0,
      });

      setServices(nextItems);
      setOffset(nextItems.length);
      setHasMore(nextItems.length === limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load services");
      setServices([]);
      setOffset(0);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [limit, query]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;

    setLoadingMore(true);
    setError(null);

    try {
      const nextItems = await listLocalServices({
        query,
        limit,
        offset,
      });

      setServices((prev) => [...prev, ...nextItems]);
      setOffset((prev) => prev + nextItems.length);
      setHasMore(nextItems.length === limit);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load more services",
      );
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, limit, loading, loadingMore, offset, query]);

  const reload = useCallback(async () => {
    await loadFirstPage();
  }, [loadFirstPage]);

  const refreshFromServer = useCallback(async () => {
    setRefreshing(true);
    setError(null);

    try {
      await refreshNow();
      await loadFirstPage();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to refresh services",
      );
    } finally {
      setRefreshing(false);
    }
  }, [loadFirstPage, refreshNow]);

  useEffect(() => {
    void loadFirstPage();
  }, [loadFirstPage]);

  const passByServiceId = useMemo(() => {
    const map = new Map<string, DeviceAccessPass>();

    for (const pass of passes) {
      map.set(pass.serviceId, pass);
    }

    return map;
  }, [passes]);

  const servicesWithAccess: ServiceWithAccess[] = useMemo(() => {
    return services.map((service) => ({
      service,
      deviceAccessPass: passByServiceId.get(service.id) ?? null,
    }));
  }, [services, passByServiceId]);

  return {
    servicesWithAccess,
    services,
    loading,
    loadingMore,
    refreshing,
    hasMore,
    error,
    reload,
    refreshFromServer,
    loadMore,
  };
}
