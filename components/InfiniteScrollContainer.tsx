import next from "next"
import { Children, cloneElement, forwardRef, isValidElement, ReactElement,  ReactNode,  useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"

export const InfiniteScrollElement = forwardRef<HTMLElement, { children: ReactNode }>(
  function InfiniteScrollElement({ children }, ref) {
    const child = Children.only(children)
    if (child && isValidElement(child)) {
      return cloneElement(child, { ref })
    } else {
      return null
    }
  }
)

export interface InfiniteScrollContainerProps {
  className?: string
  loadNext?(): Promise<any>
  loadPrev?(): Promise<any>
  loadingNext?: ReactElement
  loadingPrev?: ReactElement
}

const InfiniteScrollContainer: React.FC<InfiniteScrollContainerProps> = (props) => {
  const {
    className,
    children,
    loadNext = () => {},
    loadPrev = () => {},
    loadingNext,
    loadingPrev
  } = props

  const loadingRef = useRef<string>()
  const [loadingState, setLoadingState] = useState(loadingRef.current)

  const setLoading = useCallback((state?: string) => {
    loadingRef.current = state
    setLoadingState(state)
  }, [])

  const container = useRef<HTMLDivElement>(null);
  const pageContainer = useRef<HTMLDivElement>(null);
  const startSentinel = useRef<HTMLDivElement>(null);
  const endSentinel = useRef<HTMLDivElement>(null);
  const nextFirstPage = useRef<HTMLElement | null>(null);
  const firstPage = useRef<HTMLElement | null>(null);
  const scrollHeight = useRef<number>();

  const observer = useRef<IntersectionObserver>();

  useEffect(() => {
    observer.current = new IntersectionObserver(async (entries: IntersectionObserverEntry[]) => {
      const start = entries.find(entry => entry.target === startSentinel.current)
      const end = entries.find(entry => entry.target === endSentinel.current)

      if (end?.isIntersecting && loadingRef.current !== 'next') {
        setLoading('next')
        await loadNext()
        setLoading()
      } else if (start?.isIntersecting && loadingRef.current !== 'prev') {
        setLoading('prev')
        await loadPrev()
        setLoading()
      }
    }, {
      root: container.current,
      rootMargin: '100% 0px'
    })

    if (endSentinel.current)
      observer.current?.observe(endSentinel.current)
    if (startSentinel.current)
      observer.current?.observe(startSentinel.current)

    return () => observer.current?.disconnect()
  }, [loadNext])

  useEffect(() => {
    if (endSentinel.current)
      observer.current?.observe(endSentinel.current)
    if (startSentinel.current)
      observer.current?.observe(startSentinel.current)

    return () => observer.current?.disconnect()
  }, [children])

  useLayoutEffect(() => {
    if (firstPage.current !== nextFirstPage.current) {
      if (container.current && scrollHeight.current) {
        const diff = container.current.scrollHeight - scrollHeight.current
        container.current.scrollTop += diff
      }
      firstPage.current = nextFirstPage.current
    }
    scrollHeight.current = pageContainer.current?.scrollHeight
  })

  let renderedChildren = Children.toArray(children)
  if (renderedChildren.length > 0) {
    renderedChildren = Children.toArray(children)
    const first = renderedChildren[0]
    if (isValidElement(first)) {
      renderedChildren[0] = cloneElement(first, { ref: nextFirstPage })
    }
  }

  return <div
    ref={container}
    className={`overflow-auto ${className ?? ''}`}
  >
    {loadingState === 'prev' ? loadingPrev : null}
    <div ref={startSentinel}/>
    <div ref={pageContainer}>
      {renderedChildren}
    </div>
    <div ref={endSentinel}/>
    {loadingState === 'next' ? loadingNext : null}
  </div>
}

export default InfiniteScrollContainer