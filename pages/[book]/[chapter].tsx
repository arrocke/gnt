import { GetStaticPaths, GetStaticProps } from "next"
import client from "../../prisma/client";
import ChapterSelector from "../../components/ChapterSelector";

export const getStaticPaths: GetStaticPaths = async () => {
  const books = await client.book.findMany({
    include: {
      chapters: true
    }
  })
  const paths = books.flatMap(book => book.chapters.map(chapter => `/${book.name.replace(' ', '-').toLowerCase()}/${chapter.number}`))
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
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
  const name = book.name.split(' ').map((word: string) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(' ')
  return (
    <div>
      <h1>{name} {chapter.number}</h1>
      <ChapterSelector />
      <div>
        {verses.map((verse: any) => (
          <p key={verse.id}>
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
