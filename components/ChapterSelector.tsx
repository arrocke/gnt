import { useState } from "react"
import Link from 'next/link'

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

const ChapterSelector: React.FC = () => {
  const [book, setBook] = useState('matthew')
  const [chapter, setChapter] = useState(1)

  return <div>
    <select value={book} onChange={(e: any) => {
      setBook(e.target.value)
      setChapter(1)
    }}>
      {
        Object.keys(books).map(book =>
          <option value={book} key={book}>{toDisplayName(book)}</option>)
      }
    </select>
    <select value={chapter} onChange={(e: any) => setChapter(e.target.value)}>
      {
        Array.from({ length: books[book] }, (_, chapter) =>
          <option value={chapter + 1} key={chapter}>{chapter + 1}</option>)
      }
    </select>
    <Link href={`/${book.replace(' ', '-')}/${chapter}`}><a>Go</a></Link>
  </div>
}

export default ChapterSelector