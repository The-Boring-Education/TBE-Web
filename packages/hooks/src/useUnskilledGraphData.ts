import { envConfig } from "@tbe/constants";
import type { UnskilledGraphData } from "@tbe/interface";
import { useEffect, useState } from "react";

interface UseUnskilledGraphDataReturn {
  data: UnskilledGraphData | null;
  loading: boolean;
  error: string | null;
}

const useUnskilledGraphData = (): UseUnskilledGraphDataReturn => {
  const [data, setData] = useState<UnskilledGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGraphData = async () => {
      // Skip if API URL is not configured
      if (!envConfig.UNSKILLED_API_URL) {
        setLoading(false);
        setError("API URL not configured");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${envConfig.UNSKILLED_API_URL}/graph`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }

        const apiResponse = await response.json();
        setData(apiResponse.data || null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch graph data";
        setError(errorMessage);
        console.error("Error fetching Unskilled graph data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGraphData();
  }, []); // Empty dependency array - fetch once on mount

  return { data, loading, error };
};

export default useUnskilledGraphData;
