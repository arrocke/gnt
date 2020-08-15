import { GetStaticPaths, GetStaticProps } from "next"
import { PrismaClient } from '@prisma/client';
import client from "../../prisma/client";

export const getStaticPaths: GetStaticPaths = async () => {
  const books = await client.book.findMany({
    include: {
      chapters: true
    }
  })
  const paths = books.flatMap(book => book.chapters.map(chapter => `/${book.name.toLowerCase()}/${chapter.number}`))
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const bookName = params?.book as string
  const chapterNumber = Number(params?.chapter)
  console.log(bookName, chapterNumber)
  const book = await client.book.findOne({
    where: { name: bookName },
    include: {
      chapters: {
        where: { number: chapterNumber },
        include: {
          verses: {
            orderBy: [{ number: 'asc' }],
            include: {
              words: {
                orderBy: [{ id: 'asc' }],
                select: {
                  text: true
                }
              }
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

export default function ChapterPage({ book }: any) {
  const { chapters: [chapter] } = book
  const { verses } = chapter
  return (
    <div>
      <h1>{book.name.charAt().toUpperCase() + book.name.slice(1)} {chapter.number}</h1>
      <div>
        {verses.map((verse: any) => (
          <p>
            <strong>{verse.number}</strong>{' '}
            <span>
              {verse.words.map((verse: any) => verse.text).join(' ')}
            </span>
          </p>
        ))}
      </div>
    </div>
  )
}
