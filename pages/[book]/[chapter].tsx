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
  return (
    <div className="max-w-screen-md mx-auto px-4 sm:px-8">
      <ChapterSelector className="mt-4" book={book.name} chapter={chapter.number} />
      <h1 className="font-bold mt-4">{book.name.toUpperCase()}</h1>
      <h2 className="font-bold mt-2 text-sm">CHAPTER {chapter.number}</h2>
      <div className="mt-4 leading-relaxed">
        {verses.map((verse: any) => (
          <p key={verse.id}>
            <span className="font-bold text-xs">{verse.number}{' '}</span>
            <span className="font-greek">
              {verse.words.map((verse: any) => verse.text).join(' ')}
            </span>
          </p>
        ))}
      </div>
    </div>
  )
}
