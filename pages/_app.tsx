import '../styles/index.css'
import type { AppProps } from 'next/app'
import { ReactQueryDevtools } from 'react-query-devtools'
import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient()

function App(props: AppProps) {
  const { Component, pageProps } = props
  return <>
    <QueryClientProvider client={queryClient}>
      {/* <ReactQueryDevtools /> */}
      <Component {...pageProps} />
    </QueryClientProvider>
  </>
}

export default App
