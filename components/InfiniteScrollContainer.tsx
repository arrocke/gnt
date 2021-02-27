import { Children, cloneElement, Component, forwardRef, isValidElement, ReactElement,  ReactNode,  useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"

// TODO: end of scroll

export interface InfiniteScrollContainerProps<Page> {
  className?: string
  loadNext?(): Promise<any>
  loadPrev?(): Promise<any>
  loadingNext?: ReactElement
  loadingPrev?: ReactElement
  hasNext?: boolean
  hasPrev?: boolean
  pages: Page[]
  getPageId: (page: Page) => string
  children: (page: Page) => ReactNode
}

function InfiniteScrollContainer<Page> (props: InfiniteScrollContainerProps<Page>): ReactElement<InfiniteScrollContainerProps<Page>> {
  const {
    className,
    getPageId,
    loadNext = () => {},
    loadPrev = () => {},
    loadingNext,
    loadingPrev,
    hasNext = false,
    hasPrev = false,
    pages,
    children: renderPage
  } = props

  const container = useRef<HTMLDivElement>(null);
  const pageContainer = useRef<HTMLDivElement>(null);
  const startSentinel = useRef<HTMLDivElement>(null);
  const endSentinel = useRef<HTMLDivElement>(null);

  // We track loading as state for rendering
  // and using a ref so that the intersection callback doesn't need to be rebuild
  // when the loading state changes.
  const loadingRef = useRef<string>()
  const [loadingState, setLoadingState] = useState(loadingRef.current)
  const setLoading = useCallback((state?: string) => {
    loadingRef.current = state
    setLoadingState(state)
  }, [])

  // We track completed state as a ref for the same reason.
  const completedRef = useRef<[boolean, boolean]>([false, false])
  useEffect(() => {
    completedRef.current = [!hasPrev, !hasNext]
  }, [hasPrev, hasNext])

  const observer = useRef<IntersectionObserver>();
  useEffect(() => {
    const currentObserver = new IntersectionObserver(async (entries: IntersectionObserverEntry[]) => {
      const start = entries.find(entry => entry.target === startSentinel.current)
      const end = entries.find(entry => entry.target === endSentinel.current)

      if (end?.isIntersecting && loadingState !== 'next' && !completedRef.current[1]) {
        setLoading('next')
        await loadNext()
        setLoading()
      } else if (start?.isIntersecting && loadingState !== 'prev' && !completedRef.current[0]) {
        setLoading('prev')
        await loadPrev()
        setLoading()
      }
    }, {
      root: container.current,
      rootMargin: '0px 0px'
    })
    observer.current = currentObserver

    if (endSentinel.current)
      currentObserver.observe(endSentinel.current)
    if (startSentinel.current)
      currentObserver.observe(startSentinel.current)

    return () => currentObserver.disconnect()
  }, [loadNext, loadPrev])

  // When the list of pages change recheck whether we should load a new page
  useEffect(() => {
    if (endSentinel.current)
      observer.current?.observe(endSentinel.current)
    if (startSentinel.current)
      observer.current?.observe(startSentinel.current)

    return () => observer.current?.disconnect()
  }, [pages])

  // Preserve scroll position when appending pages.
  const firstPageId = useRef<string>('');
  const scrollState = useRef<{ height: number, top: number }>({ height: 0, top: 0});
  useLayoutEffect(() => {
    const id = pages[0] ? getPageId(pages[0]) : ''
    // We know a new page was appended when the id of the first page is different
    // And the previous first page id exists.
    if (firstPageId.current != id && firstPageId.current) {
      // We add to the scroll position the difference in height of the page list.
      if (container.current && pageContainer.current) {
        const diff = pageContainer.current.scrollHeight - scrollState.current.height
        container.current.scrollTop += diff
      }
    }
    firstPageId.current = id
    scrollState.current = {
      height: pageContainer.current?.scrollHeight ?? 0,
      top: container.current?.scrollTop ?? 0
    }
  }, [pages])

  return <div
    ref={container}
    className={`overflow-auto ${className ?? ''}`}
    onScroll={() => {
      scrollState.current = {
        height: pageContainer.current?.scrollHeight || 0,
        top: container.current?.scrollHeight || 0
      }
    }}
  >
    {loadingState === 'prev' ? loadingPrev : null}
    <div ref={startSentinel}/>
    <div ref={pageContainer}>
      {pages.map(page => renderPage(page))}
    </div>
    <div ref={endSentinel}/>
    {loadingState === 'next' ? loadingNext : null}
  </div>
}

export default InfiniteScrollContainer