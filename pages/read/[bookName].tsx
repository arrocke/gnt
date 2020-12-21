import { useRouter } from 'next/router'
import ChapterSelector from "../../components/ChapterSelector";
import { Text, Paragraph } from "@prisma/client";
import { useState, useEffect, Fragment } from "react";
import usePopover from '../../components/usePopover'
import WordPopover from "../../components/WordPopover";
import { useInfiniteQuery } from "react-query";
import InfiniteScrollContainer from '../../components/InfiniteScrollContainer';

interface QueryResult {
  data: (Paragraph & {
    text: Text[];
  })[];
}

const PAGE_SIZE = 2

// TODO: perserve scroll position when loading previous pages
// TODO: progressively load until screen is full

const ReadPage: React.FC = () => {
  const router = useRouter()
  const bookName = (router.query.bookName as string || '').replace('-', ' ')
  const reference = router.query.reference as string || '1:1'

  const { data, fetchNextPage, fetchPreviousPage } = useInfiniteQuery<QueryResult>(
    ['book-paragraphs', bookName], {
    async queryFn({ queryKey: [, bookName], pageParam = `reference=${reference}`}) {
      if (bookName) {
        const response = await fetch(`/api/books/${bookName}?page[size]=${PAGE_SIZE}${pageParam ? `&${pageParam}` : ''}`)
        return response.json()
      } else {
        return {}
      }
    },
    getNextPageParam(lastPage) {
      if (lastPage.data.length > 0) {
        return `page[start]=${lastPage.data.slice(-1)[0].id}`
      }
    },
    getPreviousPageParam(firstPage) {
      if (firstPage.data.length > 0) {
        return `page[end]=${firstPage.data[0].id}`
      }
    }
  })

  const [selectedWord, setWord] = useState<Text | undefined>(undefined)
  const { popoverRef, popoverParentRef } = usePopover()

  useEffect(() => {
    if (typeof window !== 'undefined' && !!selectedWord) {
      const handler = () => setWord(undefined)
      window.addEventListener('click', handler)
      return () => window.removeEventListener('click', handler)
    }
  }, [selectedWord])

  if (data) {
    return (
      <div
        className="h-screen flex flex-col"
        onClick={() => setWord(undefined)}
      >
        <ChapterSelector className="max-w-screen-md w-full mx-auto px-4 sm:px-8 mt-4" book={bookName} chapter={1} />
        <h1 className="max-w-screen-md w-full mx-auto px-4 sm:px-8 font-bold mt-4">{bookName.toUpperCase()}</h1>
        <WordPopover key="popover" ref={popoverRef} word={selectedWord} />
        <InfiniteScrollContainer
          className="w-full mt-4 leading-relaxed flex-1 overflow-auto"
          loadNext={async () => { await fetchNextPage() }}
          loadPrev={async () => { await fetchPreviousPage() }}
          loadingPrev={<div className="max-w-screen-md mx-auto px-4 sm:px-8">Loading...</div>}
          loadingNext={<div className="max-w-screen-md mx-auto px-4 sm:px-8">Loading...</div>}
        >
          <div className="max-w-screen-md mx-auto px-4 sm:px-8">
            {data.pages.map(group =>  group.data?.map(paragraph => (
              <p key={paragraph.id} className="mt-2">
                {paragraph.text.map((word, i, words) => (
                  <Fragment key={word.id}> 
                    {(i === 0 || words[i - 1].verseNumber !== word.verseNumber) && (
                      <span className="font-bold font-sans text-xs">
                        {`${word.verseNumber === 1 ? `${word.chapter}:` : ''}${word.verseNumber} `}
                      </span>
                    )}
                    <span
                      ref={selectedWord === word ? popoverParentRef : null}
                      className={`relative inline-block font-greek ${selectedWord === word ? 'bg-black text-white' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        setWord(word)
                      }}
                    >
                      {word.text}
                    </span>{' '}
                  </Fragment>
                ))}
              </p>
            )))}
          </div>
        </InfiniteScrollContainer>
      </div>
    )
  } else {
    return null
  }
}
export default ReadPage
