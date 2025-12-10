import { envConfig } from "@tbe/constants";
import type { UnskilledGraphData } from "@tbe/interface";
import { useEffect, useRef, useState } from "react";

interface UseUnskilledGraphDataReturn {
  data: UnskilledGraphData | null;
  loading: boolean;
  error: string | null;
}

const useUnskilledGraphData = (): UseUnskilledGraphDataReturn => {
  const [data, setData] = useState<UnskilledGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate fetches (React Strict Mode causes double mount in dev)
    if (hasFetchedRef.current) {
      return;
    }

    const fetchGraphData = async () => {
      // Skip if API URL is not configured
      if (!envConfig.UNSKILLED_API_URL) {
        setLoading(false);
        setError("API URL not configured");
        return;
      }

      const controller = new AbortController();
      const startTime = performance.now();

      try {
        setLoading(true);
        setError(null);
        console.log("[Graph Data] Fetching from:", `${envConfig.UNSKILLED_API_URL}/graph`);

        const response = await fetch(`${envConfig.UNSKILLED_API_URL}/graph`, {
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });

        const fetchTime = (performance.now() - startTime).toFixed(2);
        console.log(`[Graph Data] API responded in ${fetchTime}ms`);

        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }

        const apiResponse = await response.json();
        console.log("[Graph Data] Data parsed successfully");
        setData(apiResponse.data || null);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          console.log("[Graph Data] Fetch aborted");
          return;
        }
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch graph data";
        setError(errorMessage);
        console.error("[Graph Data] Error:", err);
      } finally {
        setLoading(false);
      }
    };

    hasFetchedRef.current = true;
    fetchGraphData();

    // Cleanup function - this is what React Strict Mode tests
    return () => {
      // Don't reset hasFetchedRef on cleanup to prevent refetch
      console.log("[Graph Data] Component cleanup (Strict Mode unmount)");
    };
  }, []);

  return { data, loading, error };
};

export default useUnskilledGraphData;
