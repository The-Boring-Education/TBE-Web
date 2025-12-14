import '@/styles/globals.css';
import '@/styles/colors.css';
import type { AppProps } from 'next/app';
import { Layout } from '@tbe/components';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from 'react-query';

// Create a client
const queryClient = new QueryClient();

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider
      session={session}
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus
    >
      <QueryClientProvider client={queryClient}>
        {/* <Layout> */}
          <Component {...pageProps} />
        {/* </Layout> */}
      </QueryClientProvider>
    </SessionProvider>
  );
}
