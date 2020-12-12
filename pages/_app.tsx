import '../styles/index.css'
import type { AppProps } from 'next/app'
import { ReactQueryDevtools } from 'react-query-devtools'
import { QueryCache, ReactQueryCacheProvider } from 'react-query'

const queryCache = new QueryCache()

function App(props: AppProps) {
  const { Component, pageProps } = props
  return <>
    <ReactQueryCacheProvider queryCache={queryCache}>
      <ReactQueryDevtools />
      <Component {...pageProps} />
    </ReactQueryCacheProvider>
  </>
}

export default App
