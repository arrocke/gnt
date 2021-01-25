import { ReactNode, Reducer, useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from "react"

interface LoaderFn {
  (): Promise<any>
}

export interface InfiniteScrollContainerProps {
  className?: string
  loadNext?: LoaderFn
  loadPrev?: LoaderFn
}

const InfiniteScrollContainer: React.FC<InfiniteScrollContainerProps> = (props) => {
  const {
    className,
    children,
    loadNext = () => {},
    loadPrev = () => {}
  } = props

  const container = useRef<HTMLDivElement>(null);
  const startSentinel = useRef<HTMLDivElement>(null);
  const endSentinel = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver>();
  const loading = useRef<[boolean, boolean]>([false, false])
  const [isLoading, setLoadingState] = useState<[boolean, boolean]>([false, false])
  const scrollState = useRef({ scrollHeight: 0, clientHeight: 0, position: 0 })

  useLayoutEffect(() => {
    if (container.current) {
      // if (loading.current?.[0]) {
      //   const { scrollHeight, clientHeight } = container.current
      //   const diff = scrollHeight - scrollState.current.scrollHeight
      //   const position = scrollState.current.position + diff
      //   container.current.scrollTo(0, position)
      //   scrollState.current = { scrollHeight, clientHeight, position }
      // } else {
        const { scrollHeight, clientHeight } = container.current
        scrollState.current = { scrollHeight, clientHeight, position: scrollState.current.position }
      // }
    }

    // Check the sentinels again.
    // This will load the next page if the container isn't full.
    if (observer.current) {
      console.log('test')
      observer.current.disconnect()
      if (endSentinel.current)
        observer.current.observe(endSentinel.current)
      if (startSentinel.current)
        observer.current.observe(startSentinel.current)
    }
  }, [children])

  const setLoading = useCallback((fn: ((state: [boolean, boolean]) => [boolean, boolean])) => {
    setLoadingState(fn)
    loading.current = fn(loading.current)
  }, [])

  useEffect(() => {
    observer.current = new IntersectionObserver(async (entries) => {
      const end = entries.find(entry => entry.target === endSentinel.current)
      if (end?.isIntersecting && !loading.current[1]) {
        setLoading(([l]) => [l, true])
        await loadNext()
        setLoading(([l]) => [l, false])
      }

      // Wait to load previous pages until container is full.
      if (scrollState.current.scrollHeight > scrollState.current.clientHeight) {
        const start = entries.find(entry => entry.target === startSentinel.current)
        if (start?.isIntersecting && !loading.current[0]) {
          setLoading(([,l]) => [true, l])
          await loadPrev()
          setLoading(([,l]) => [false, l])
        }
      }

    }, {
      root: container.current, 
      rootMargin: '30% 0px'
    })

    if (startSentinel.current)
      observer.current.observe(startSentinel.current)
    if (endSentinel.current)
      observer.current.observe(endSentinel.current)

    return () => observer.current?.disconnect()
  }, [])

  return <div className={className}>
    <div
      ref={container}
      className="m-auto w-1/2 h-full bg-red-300 overflow-auto"
      onScroll={() => {
        scrollState.current = {
          scrollHeight: container.current?.scrollHeight ?? 0,
          clientHeight: container.current?.clientHeight ?? 0,
          position: container.current?.scrollTop ?? 0
        }
      }}
    >
      <div ref={startSentinel}/>
      {/* {isLoading[0] ? <div>Loading...</div> : null} */}
      {children}
      {/* {isLoading[1] ? <div>Loading...</div> : null} */}
      <div ref={endSentinel}/>
    </div>
  </div>
}

export default InfiniteScrollContainer