import { GetStaticPaths, GetStaticProps } from "next"
import client from "../../prisma/client";
import ChapterSelector from "../../components/ChapterSelector";
import { Book, Chapter, Verse, Text } from "@prisma/client";
import { useState, useEffect } from "react";
import usePopover from '../../components/usePopover'
import WordPopover from "../../components/WordPopover";

interface Props {
  book: (Book & {
    chapters: (Chapter & {
        verses: (Verse & {
          text: Text[]
        })[];
    })[];
}) | null
}

export const getStaticPaths: GetStaticPaths = async () => {
  const books = await client.book.findMany({
    include: {
      chapters: true
    }
  })
  const paths = books.flatMap(book => book.chapters.map(chapter => `/${book.name.replace(' ', '-').toLowerCase()}/${chapter.number}`))
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const bookName = (params?.book as string).replace('-', ' ')
  const chapterNumber = Number(params?.chapter)
  const book = await client.book.findOne({
    where: { name: bookName },
    include: {
      chapters: {
        where: { number: chapterNumber },
        include: {
          verses: {
            orderBy: [{ number: 'asc' }],
            include: {
              text: true
            }
          }
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

const ChapterPage: React.FC<Props> = ({ book }) => {
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
    const { chapters: [chapter] } = book
    const { verses } = chapter
    return (
      <div className="max-w-screen-md mx-auto px-4 sm:px-8" onClick={() => setWord(null)}>
        <ChapterSelector className="mt-4" book={book.name} chapter={chapter.number} />
        <h1 className="font-bold mt-4">{book.name.toUpperCase()}</h1>
        <h2 className="font-bold mt-2 text-sm">CHAPTER {chapter.number}</h2>
        <div className="mt-4 leading-relaxed">
          <WordPopover ref={popoverRef} word={selectedWord} />
          {verses.map((verse) => (
            <p key={verse.id}>
              <span className="font-bold text-xs">{verse.number}{' '}</span>
              <span className="font-greek">
                {verse.text.map((word) => (
                  <> 
                    <span
                      ref={selectedWord === word ? popoverParentRef : null}
                      className={`relative inline-block ${selectedWord === word ? 'bg-black text-white' : ''}`}
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
              </span>
            </p>
          ))}
        </div>
      </div>
    )
  } else {
    return null
  }
}
export default ChapterPage
