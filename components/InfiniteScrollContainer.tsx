import { ReactNode, Reducer, useCallback, useEffect, useReducer, useRef, useState } from "react"

interface LoaderFn {
  (): void | Promise<void>
}

export interface InfiniteScrollContainerProps {
  className?: string
  loadNext?: LoaderFn
  loadPrev?: LoaderFn
  loadingPrev?: ReactNode
  loadingNext?: ReactNode
}

type ReducerAction = 'prev' | 'next'
type ReducerState = [boolean, boolean]

function reducer(loadPrev: LoaderFn, loadNext: LoaderFn) {
  return (action: ReducerAction, state: ReducerState) => {
    switch(action) {
      case 'prev': {
        if (!state[0]) {
          return [true, state[1]]
        }
      }
      case 'next': {
        return [state[0], true]
      }
    }
  }
}

const InfiniteScrollContainer: React.FC<InfiniteScrollContainerProps> = ({
  className,
  children,
  loadNext = () => {},
  loadPrev = () => {},
  loadingNext,
  loadingPrev
}) => {
  const loadingStateRef = useRef<[boolean, boolean]>([false, false])
  const [loadingState, setLoadingState] = useState<[boolean, boolean]>([false, false])
  const startElement = useRef<HTMLDivElement | null>(null)
  const endElement = useRef<HTMLDivElement | null>(null)
  const containerElement = useRef<HTMLDivElement | null>(null)
  const observer = useRef<IntersectionObserver | null>(null)

  const setLoading = useCallback((fn: ((state: [boolean, boolean]) => [boolean, boolean])) => {
    setLoadingState(fn)
    loadingStateRef.current = fn(loadingStateRef.current)
  }, [])

  // Can I use a reducer to track loading state and execute data loading functions?

  useEffect(() => {
    observer.current = new IntersectionObserver(async (entries) => {
      const start = entries.find(entry => entry.target === startElement.current)
      const end = entries.find(entry => entry.target === endElement.current)
      if (start && start.isIntersecting && !loadingStateRef.current[0]) {
        setLoading(([, next]) => [true, next])
        await loadPrev()
        setLoading(([, next]) => [false, next])
      }
      if (end && end.isIntersecting && !loadingStateRef.current[1]) {
        setLoading(([prev]) => [prev, true])
        await loadNext()
        setLoading(([prev]) => [prev, false])
      }
    }, {
      root: containerElement.current,
      // This will start loading when one screen full of data is still left to scroll.
      rootMargin: '100% 0px'
    })
    if (endElement.current) {
      observer.current.observe(endElement.current)
    }
    if (startElement.current) {
      observer.current.observe(startElement.current)
    }
    return () => observer.current?.disconnect()
  }, [])

  return <div ref={containerElement} className={className}>
    <div ref={startElement}/>
    {loadingState[0] ? loadingPrev : null}
    {children}
    {loadingState[1] ? loadingNext : null}
    <div ref={endElement}/>
  </div>
}

export interface InfiniteScrollItemProps {
  isLast?: boolean
  isFirst?: boolean
}

export default InfiniteScrollContainer