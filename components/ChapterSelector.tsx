import { useEffect, useState } from "react"
import Link from 'next/link'
import SelectInput from "./SelectInput"
import LinkButton from "./LinkButton"

const books: { [book: string]: number } = {
  "matthew": 28,
  "mark": 16,
  "luke": 24,
  "john": 21,
  "acts": 28,
  "romans": 16,
  "1 corinthians": 16,
  "2 corinthians": 13,
  "galatians": 6,
  "ephesians": 6,
  "philippians": 4,
  "colossians": 4,
  "1 thessalonians": 5,
  "2 thessalonians": 3,
  "1 timothy": 6,
  "2 timothy": 4,
  "titus": 3,
  "philemon": 1,
  "hebrews": 13,
  "james": 5,
  "1 peter": 5,
  "2 peter": 3,
  "1 john": 5,
  "2 john": 1,
  "3 john": 1,
  "jude": 1,
  "revelation": 22
}

function toDisplayName(book: string) {
  return book.split(' ').map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(' ')
}

export interface ChapterSelectorProps {
  className?: string
  book?: string
  chapter?: number
}

const ChapterSelector: React.FC<ChapterSelectorProps> = ({
  className = '',
  book: defaultBook = 'matthew',
  chapter: defaultChapter = 1
}) => {
  const [book, setBook] = useState(defaultBook)
  const [chapter, setChapter] = useState(defaultChapter)

  useEffect(() => {
    setBook(defaultBook)
  }, [defaultBook])

  const bookId = `select-book`
  const chapterId = `select-chapter`

  return <div
    className={`
      flex
      ${className}
    `}
  >
    <div className="-ml-1">
      <label className="block font-bold text-xs h-5 ml-1" htmlFor={bookId}>BOOK</label>
      <SelectInput
        id={bookId}
        value={book}
        onChange={(e: any) => {
          setBook(e.target.value)
          setChapter(1)
        }}
      >
        {
          Object.keys(books).map(book =>
            <option value={book} key={book}>{toDisplayName(book)}</option>)
        }
      </SelectInput>
    </div>
    <div className="ml-4">
      <label className="block font-bold text-xs h-5 ml-1" htmlFor={chapterId}>CHAPTER</label>
      <SelectInput
        className="w-20"
        id={chapterId}
        value={chapter}
        onChange={(e: any) => setChapter(e.target.value)}
      >
        {
          Array.from({ length: books[book] }, (_, chapter) =>
            <option value={chapter + 1} key={chapter}>{chapter + 1}</option>)
        }
      </SelectInput>
    </div>
    <Link
      href={`/read/${book.replace(' ', '-')}?reference=${chapter}:1`}
      passHref
    >
      <LinkButton className="ml-4 mt-5">Go</LinkButton>
    </Link>
  </div>
}

export default ChapterSelector