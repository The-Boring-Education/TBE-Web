import { envConfig } from "@tbe/constants";
import type { UnskilledTrendData } from "@tbe/interface";
import { useQuery } from "react-query";

interface UseUnskilledTrendDataParams {
  perspective_type: string | null;
  perspective_name: string | null;
}

interface UseUnskilledTrendDataReturn {
  data: UnskilledTrendData | null;
  loading: boolean;
  error: string | null;
}

const fetchTrendData = async (
  perspective_type: string,
  perspective_name: string
): Promise<UnskilledTrendData> => {
  if (!envConfig.UNSKILLED_API_URL) {
    throw new Error("API URL not configured");
  }

  const url = new URL(`${envConfig.UNSKILLED_API_URL}/graph`);
  url.searchParams.set("perspective_type", perspective_type);
  url.searchParams.set("perspective_name", perspective_name);

  const response = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API responded with status ${response.status}`);
  }

  const apiResponse = await response.json();
  return apiResponse.data || null;
};

const useUnskilledTrendData = ({
  perspective_type,
  perspective_name,
}: UseUnskilledTrendDataParams): UseUnskilledTrendDataReturn => {
  const isEnabled = !!perspective_type && !!perspective_name;

  const { data, isLoading, error } = useQuery(
    ["unskilled-trend", perspective_type, perspective_name],
    () => fetchTrendData(perspective_type!, perspective_name!),
    {
      enabled: isEnabled,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );

  return {
    data: data || null,
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
  };
};

export default useUnskilledTrendData;
