import { useRouter } from 'next/router'
import ChapterSelector from "../../components/ChapterSelector";
import { Text, Paragraph } from "@prisma/client";
import { useState, useEffect, Fragment } from "react";
import usePopover from '../../components/usePopover'
import WordPopover from "../../components/WordPopover";
import { useInfiniteQuery } from "react-query";
import InfiniteScroll from 'react-infinite-scroll-component';

interface QueryResult {
  data: (Paragraph & {
    text: Text[];
  })[];
}

const ReadPage: React.FC = () => {
  const router = useRouter()
  const bookName = (router.query.bookName as string || '').replace('-', ' ')
  const bookQuery = useInfiniteQuery<QueryResult>(['book-paragraphs', bookName], async (key, bookName, start = 0) => {
    const response = await fetch(`/api/books/${bookName}?page[size]=15&page[start]=${start}`)
    return response.json()
  }, {
    getFetchMore(previous) {
      if (previous.data.length === 0) {
        return false
      } else {
        return previous.data[previous.data.length - 1].id
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

  if (bookQuery.data) {
    return (
      <div className="max-w-screen-md mx-auto px-4 sm:px-8" onClick={() => setWord(undefined)}>
        <ChapterSelector className="mt-4" book={bookName} chapter={1} />
        <h1 className="font-bold mt-4">{bookName.toUpperCase()}</h1>
        <WordPopover key="popover" ref={popoverRef} word={selectedWord} />
        <div className="mt-4 leading-relaxed">
          <InfiniteScroll
            dataLength={bookQuery.data.length}
            next={() => bookQuery.fetchMore()}
            hasMore={bookQuery.canFetchMore ?? true}
            loader={<p className="mt-6 mb-12 text-center">Loading...</p>}
            scrollThreshold="60%"
            endMessage={<p className="mt-6 mb-12 text-center">End of Chapter</p>}
          >
          {bookQuery.data.map(group =>  group.data?.map(paragraph => (
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
          </InfiniteScroll>
        </div>
      </div>
    )
  } else {
    return null
  }
}
export default ReadPage
