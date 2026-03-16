import { CACHE_TIMES, useQuery } from "@tbe/query";

const UNSKILLED_API_URL = process.env.NEXT_PUBLIC_UNSKILLED_API_URL;

const useUnskilledGraphData = () => {
  const { data, isLoading, error } = useQuery<any>({
    queryKey: ["unskilled", "graph"],
    queryFn: async () => {
      const response = await fetch(`${UNSKILLED_API_URL}/graph`);
      if (!response.ok) throw new Error("Failed to fetch graph data");
      return response.json();
    },
    ...CACHE_TIMES.STATIC,
    enabled: !!UNSKILLED_API_URL,
  });

  return {
    data: data ?? null,
    loading: isLoading,
    error: error?.message ?? null,
  };
};

export default useUnskilledGraphData;
