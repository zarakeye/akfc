import { useEffect, useState } from "react";
import type { FileAdapter } from "@features/finder-core/types";
import { useFinderStore } from "@features/finder-core/state/useFinderStore";

type UseFinderDataResult = {
  loading: boolean;
  error: string | null;
};

export function useFinderData(adapter: FileAdapter): UseFinderDataResult {
  const currentPath = useFinderStore((state) => state.currentPath);
  const setContent = useFinderStore((state) => state.setContent);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const result = await adapter.list({
          path: currentPath
        });

        if (cancelled) return;

        setContent({
          folders: result.folders,
          files: result.files
        });
      } catch (err) {
        if (cancelled) return;

        console.error('[useFinderData]', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [currentPath, adapter, setContent]);

  return {
    loading,
    error
  };
}