import { useRouter } from 'next/router'
import ChapterSelector from "../../components/ChapterSelector";
import { Text, Paragraph } from "@prisma/client";
import { useState, useEffect, Fragment } from "react";
import usePopover from '../../components/usePopover'
import WordPopover from "../../components/WordPopover";
import { useInfiniteQuery } from "react-query";
import InfiniteScrollContainer from '../../components/InfiniteScrollContainer';

interface QueryResult {
  links: {
    next: string | null
    prev: string | null
  }
  data: (Paragraph & {
    text: Text[];
  })[];
}

const PAGE_SIZE = 6 

const ReadPage: React.FC = () => {
  const router = useRouter()
  const bookName = (router.query.bookName as string || '').replace('-', ' ')
  const reference = router.query.reference as string || '1:1'

  const { data, fetchNextPage, fetchPreviousPage, hasNextPage, hasPreviousPage } = useInfiniteQuery<QueryResult>(
    ['book-paragraphs', bookName], {
    async queryFn({ queryKey: [, bookName], pageParam}) {
      if (bookName) {
        let response
        if (pageParam) {
          response = await fetch(pageParam)
        } else {
          response = await fetch(`/api/books/${bookName}?page[size]=${PAGE_SIZE}&reference=${reference}`)
        }
        return response.json()
      } else {
        return {}
      }
    },
    getNextPageParam(lastPage) {
      return lastPage.links.next || undefined
    },
    getPreviousPageParam(firstPage) {
      return firstPage.links.prev || undefined
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


  return (
    <div
      className="h-screen flex flex-col"
      onClick={() => setWord(undefined)}
    >
      <ChapterSelector className="max-w-screen-md w-full mx-auto px-4 sm:px-8 mt-4" book={bookName} chapter={1} />
      <h1 className="max-w-screen-md w-full mx-auto px-4 sm:px-8 font-bold mt-4">{bookName.toUpperCase()}</h1>
      <WordPopover key="popover" ref={popoverRef} word={selectedWord} />
      <InfiniteScrollContainer
        className="w-full leading-relaxed flex-1"
        pages={data?.pages ?? []}
        loadNext={fetchNextPage}
        loadPrev={fetchPreviousPage}
        hasNext={hasNextPage}
        hasPrev={hasPreviousPage}
        loadingPrev={<div className="max-w-screen-md mx-auto px-4 sm:px-8">Loading...</div>}
        loadingNext={<div className="max-w-screen-md mx-auto px-4 sm:px-8">Loading...</div>}
        getPageId={(page) => page.data[0]?.id.toString() ?? ''}
      >
        {(page) => 
          <div key={page.data[0]?.id ?? ''}>
            {page.data?.map(paragraph => (
              <p key={paragraph.id} className="pt-2 max-w-screen-md mx-auto px-4 sm:px-8">
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
            ))}
          </div>
        }
      </InfiniteScrollContainer>
    </div>
  )
}
export default ReadPage
