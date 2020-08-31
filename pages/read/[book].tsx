import { GetStaticPaths, GetStaticProps } from "next"
import client from "../../prisma/client";
import ChapterSelector from "../../components/ChapterSelector";
import { Book, Text, Paragraph } from "@prisma/client";
import { useState, useEffect } from "react";
import usePopover from '../../components/usePopover'
import WordPopover from "../../components/WordPopover";

interface Props {
  book: (Book & {
    paragraphs: (Paragraph & {
        text: Text[];
    })[];
}) | null
}

export const getStaticPaths: GetStaticPaths = async () => {
  const books = await client.book.findMany()
  const paths = books.map(book => `/read/${book.name.replace(' ', '-').toLowerCase()}`)
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const bookName = (params?.book as string).replace('-', ' ')
  const book = await client.book.findOne({
    where: { name: bookName },
    include: {
      paragraphs: {
        include: {
          text: true
        }
      }
    }
  })
  return {
    props: {
      book
    }
  };
}

const ReadPage: React.FC<Props> = ({ book }) => {
  const [selectedWord, setWord] = useState<Text | undefined>(undefined)
  const { popoverRef, popoverParentRef } = usePopover()

  useEffect(() => {
    if (typeof window !== 'undefined' && !!selectedWord) {
      const handler = () => setWord(undefined)
      window.addEventListener('click', handler)
      return () => window.removeEventListener('click', handler)
    }
  }, [selectedWord])

  if (book) {
    return (
      <div className="max-w-screen-md mx-auto px-4 sm:px-8" onClick={() => setWord(undefined)}>
        {/* <ChapterSelector className="mt-4" book={book.name} chapter={chapter.number} /> */}
        <h1 className="font-bold mt-4">{book.name.toUpperCase()}</h1>
        <div className="mt-4 leading-relaxed">
          <WordPopover ref={popoverRef} word={selectedWord} />
          {book.paragraphs.map(paragraph => (
            <p key={paragraph.id} className="mt-2">
              {paragraph.text.map((word, i, words) => (
                <> 
                  {(i === 0 || words[i - 1].verseNumber !== word.verseNumber) && (
                    <span className="font-bold font-sans text-xs">
                      {word.verseNumber === 1 && `${word.chapter}:`}{word.verseNumber}{' '}
                    </span>
                  )}
                  <span
                    ref={selectedWord === word ? popoverParentRef : null}
                    className={`relative inline-block font-greek ${selectedWord === word ? 'bg-black text-white' : ''}`}
                    key={word.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      setWord(word)
                    }}
                  >
                    {word.text}
                  </span>{' '}
                </>
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
