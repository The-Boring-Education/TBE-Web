import { useQuery } from "@tanstack/react-query";

import api from "@/lib/axios";
import { logApiError } from "@/utils/errorLogger";

export interface ProductInfo {
  _id: string;
  name: string;
  type: string;
  price?: number;
  isPremium?: boolean;
  isActive?: boolean;
}

export interface ProductsResponse {
  interviewSheets: ProductInfo[];
  courses: ProductInfo[];
  projects: ProductInfo[];
  webinars: ProductInfo[];
}

export interface FlatProduct extends ProductInfo {
  category: string;
}

// Get all products grouped by type
export const useProducts = () => {
  const query = useQuery<{ data: ProductsResponse }>({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        const res = await api.get("/products");
        return {
          data: res.data?.data || {
            interviewSheets: [],
            courses: [],
            projects: [],
            webinars: [],
          },
        };
      } catch (error) {
        logApiError(error, "Fetch Products", false);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
  });

  return {
    ...query,
    data: (query.data?.data || {
      interviewSheets: [],
      courses: [],
      projects: [],
      webinars: [],
    }) as ProductsResponse,
    isLoading: query.isLoading,
  };
};

// Get all products as a flat array for easier selection
export const useFlatProducts = () => {
  const { data: products, isLoading, error } = useProducts();

  const flatProducts: FlatProduct[] = [
    ...products.interviewSheets.map((p) => ({
      ...p,
      category: "Interview Sheets",
    })),
    ...products.courses.map((p) => ({ ...p, category: "Courses" })),
    ...products.projects.map((p) => ({ ...p, category: "Projects" })),
    ...products.webinars.map((p) => ({ ...p, category: "Webinars" })),
  ];

  return {
    data: flatProducts,
    isLoading,
    error,
    groupedData: products,
  };
};

// Helper function to get products by their IDs
export const getProductsByIds = (
  products: FlatProduct[],
  productIds: string[],
): FlatProduct[] => {
  if (!productIds || productIds.length === 0) return [];
  return products.filter((product) => productIds.includes(product._id));
};

// Helper function to format product display name
export const formatProductDisplayName = (product: FlatProduct): string => {
  const price = product.price
    ? ` (₹${product.price.toLocaleString("en-IN")})`
    : "";
  return `${product.name}${price}`;
};
