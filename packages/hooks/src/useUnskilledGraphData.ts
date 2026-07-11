import { CACHE_TIMES, useQuery } from "@tbe/query";
import { sendRequest } from "@tbe/utils";

const useUnskilledGraphData = () => {
  const { data, isLoading, error } = useQuery<any>({
    queryKey: ["unskilled", "graph"],
    queryFn: async () => {
      const response = await sendRequest({
        method: "GET",
        url: "/v1/unskilled",
      });
      if (!response.status) throw new Error("Failed to fetch graph data");
      return response.data;
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
