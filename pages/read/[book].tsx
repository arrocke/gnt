import { useRouter } from 'next/router'
import ChapterSelector from "../../components/ChapterSelector";
import { Text, Paragraph } from "@prisma/client";
import { useState, useEffect, Fragment } from "react";
import usePopover from '../../components/usePopover'
import WordPopover from "../../components/WordPopover";
import { useQuery } from "react-query";

interface QueryResult {
  data: (Paragraph & {
    text: Text[];
  })[];
}

const ReadPage: React.FC = () => {
  const router = useRouter()
  const bookName = router.query.book as string
  const bookQuery = useQuery<QueryResult>(['book-paragraphs', bookName], async (key, bookName) => {
    const response = await fetch(`/api/paragraphs?reference=${bookName}-1:1`)
    return response.json()
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
        {/* <ChapterSelector className="mt-4" book={book.name} chapter={chapter.number} /> */}
        <h1 className="font-bold mt-4">{bookName.toUpperCase()}</h1>
        <div className="mt-4 leading-relaxed">
          <WordPopover key="popover" ref={popoverRef} word={selectedWord} />
          {bookQuery.data?.data?.map(paragraph => (
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
          ))}
        </div>
      </div>
    )
  } else {
    return null
  }
}
export default ReadPage
