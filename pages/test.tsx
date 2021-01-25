import { useInfiniteQuery } from "react-query";
import InfiniteScrollContainer from "../components/InfiniteScrollContainer";

const TestPage: React.FC = () => {
  const { data, fetchNextPage, fetchPreviousPage } = useInfiniteQuery<{ name: string, page: number }>(
    ['test'], {
    async queryFn({ pageParam = 1}) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            name: `Page ${pageParam}`,
            page: pageParam
          })
        }, 500)
      })
    },
    getNextPageParam(lastPage) {
      return lastPage.page + 1
    },
    getPreviousPageParam(firstPage) {
      return firstPage.page - 1
    }
  })

  return <InfiniteScrollContainer
    className="w-screen h-screen"
    loadNext={fetchNextPage}
    loadPrev={fetchPreviousPage}
  >
    {data?.pages.map(page =>
      <div
        key={page.page}
        className="h-64 border-black border"
      >
        {page.name}
      </div>
    )}
  </InfiniteScrollContainer>
}

export default TestPage