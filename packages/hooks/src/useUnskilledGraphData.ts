import { CACHE_TIMES, useQuery } from "@tbe/query";

const useUnskilledGraphData = () => {
  const { data, isLoading, error } = useQuery<any>({
    queryKey: ["unskilled", "graph"],
    queryFn: async () => {
      const response = await fetch("/api/unskilled/graph");
      if (!response.ok) throw new Error("Failed to fetch graph data");
      return response.json();
    },
    ...CACHE_TIMES.STATIC,
  });

  return {
    data: data ?? null,
    loading: isLoading,
    error: error?.message ?? null,
  };
};

export default useUnskilledGraphData;
