import { GetStaticPaths, GetStaticProps } from "next"
import client from "../../prisma/client";
import ChapterSelector from "../../components/ChapterSelector";
import { Book, Chapter, Verse, Word, Lemma, Text } from "@prisma/client";
import Popover from "../../components/Popover";
import { useState, useEffect } from "react";
import { CLIENT_RENEG_WINDOW } from "tls";
import { makeDocument } from "@prisma/client/runtime";

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
  const [wordPopover, setWordPopover] = useState<number | null>(null)

  if (book) {
    const { chapters: [chapter] } = book
    const { verses } = chapter
    return (
      <div className="max-w-screen-md mx-auto px-4 sm:px-8" onClick={() => setWordPopover(null)}>
        <ChapterSelector className="mt-4" book={book.name} chapter={chapter.number} />
        <h1 className="font-bold mt-4">{book.name.toUpperCase()}</h1>
        <h2 className="font-bold mt-2 text-sm">CHAPTER {chapter.number}</h2>
        <div className="mt-4 leading-relaxed">
          {verses.map((verse) => (
            <p key={verse.id}>
              <span className="font-bold text-xs">{verse.number}{' '}</span>
              <span className="font-greek">
                {verse.text.map((word) => (
                  <> 
                    <span
                      className="relative inline-block"
                      key={word.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        setWordPopover(word.id)
                      }}
                    >
                      {word.text}
                      <Popover visible={wordPopover === word.id}>
                        <p>{word.lemma}</p>
                        <p className="whitespace-no-wrap">{word.parsing}</p>
                      </Popover>
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
