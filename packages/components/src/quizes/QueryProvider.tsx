'use client'

import { QueryClient, QueryClientProvider } from "react-query"
import type { ReactNode} from "react";
import { useState } from "react"

interface QueryProviderProps {
    children: ReactNode
}

const QueryProvider = ({ children }: QueryProviderProps) => {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                retry: 1,
                refetchOnWindowFocus: false,
                staleTime: 5 * 60 * 1000 // 5 minutes
            }
        }
    }))

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
};

export default QueryProvider;