import type { AppProps } from 'next/app'

// API-only app - no UI components needed
export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
