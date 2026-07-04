import { CACHE_TIMES, useQuery } from "@tbe/query";

const UNSKILLED_API_URL = process.env.NEXT_PUBLIC_UNSKILLED_API_URL;

const useUnskilledGraphData = () => {
  const { data, isLoading, error } = useQuery<any>({
    queryKey: ["unskilled", "graph"],
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15_000);
      try {
        const response = await fetch(`${UNSKILLED_API_URL}/graph`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Failed to fetch graph data");
        return response.json();
      } catch (error) {
        if (
          error instanceof TypeError &&
          /failed to fetch/i.test(error.message)
        ) {
          throw new Error(
            "Unable to load market insights. Please try again later.",
          );
        }
        if (error instanceof DOMException && error.name === "AbortError") {
          throw new Error(
            "Market insights request timed out. Please try again later.",
          );
        }
        throw error;
      } finally {
        clearTimeout(timeoutId);
      }
    },
    ...CACHE_TIMES.STATIC,
    enabled: !!UNSKILLED_API_URL,
    retry: 1,
  });

  return {
    data: data ?? null,
    loading: isLoading,
    error: error?.message ?? null,
  };
};

export default useUnskilledGraphData;
