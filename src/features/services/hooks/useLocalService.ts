import { useCallback, useState } from "react";

import { getLocalServiceByClientId } from "@/src/db/services/servicesDb";

export function useLocalService() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocalService = useCallback(async (clientId: string) => {
    setError(null);

    if (!clientId) {
      return null;
    }

    setLoading(true);

    try {
      const service = await getLocalServiceByClientId(clientId);
      setLoading(false);
      return service;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load service");
      setLoading(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getLocalService,
  };
}
