import { GetStaticPaths, GetStaticProps } from "next"
import client from "../../prisma/client";
import ChapterSelector from "../../components/ChapterSelector";
import { Book, Chapter, Verse, Text } from "@prisma/client";
import { useState, useEffect } from "react";
import usePopover from '../../components/usePopover'

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

const speechMap: {[code: string]: string } = {
  A: 'adjective',
  C: "conjunction",
  D: "adverb",
  I: "interjection",
  N: "noun",
  P: "preposition",
  RA: "definite article",
  RD: "demonst pronoun",
  RI: "inter/indef pronoun",
  RP: "pers pronoun",
  RR: "rel pronoun",
  V: "verb",
  X: "particle"
}

const personMap: {[code: string]: string } = {
  '1': '1st',
  '2': '2nd',
  '3': '3rd'
}

const tenseMap: {[code: string]: string } = {
  "P":	"present",
  "I":	"imperfect",
  "F":	"future",
  "A":	"aorist",
  "X":	"perfect",
  "Y":	"pluperfect",
}

const voiceMap: {[code: string]: string } = {
  "A":	"active",
  "M":	"middle",
  "P":	"passive"
}

const moodMap: {[code: string]: string } = {
  "I":	"indicative",
  "D":	"imperative",
  "S":	"subjunctive",
  "O":	"optative",
  "N":	"infinitive",
  "P":	"participle",
}

const caseMap: {[code: string]: string } = {
  "N":	"nominative",
  "G":	"genitive",
  "D":	"dative",
  "A":	"accusative",
}

const numberMap: {[code: string]: string } = {
  P: 'plural',
  S: 'singular'
}

const genderMap: {[code: string]: string } = {
  M: 'masculine',
  F: 'feminine',
  N: 'neuter'
}

const degreeMap: {[code: string]: string } = {
  "C":	"comparative",
  "S":	"superlative"
}

function convertCodeToParsing(code: string) {
  return [
    personMap[code[0]],
    tenseMap[code[1]],
    voiceMap[code[2]],
    moodMap[code[3]],
    caseMap[code[4]],
    numberMap[code[5]],
    genderMap[code[6]],
    degreeMap[code[7]]
  ].filter(x => !!x).join(' ')
}


const ChapterPage: React.FC<Props> = ({ book }) => {
  const [selectedWord, setWord] = useState<Text | null>(null)
  const { popoverRef, popoverParentRef } = usePopover()

  useEffect(() => {
    if (typeof window !== 'undefined' && !!selectedWord) {
      const handler = () => setWord(null)
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
          {selectedWord && 
            <div
              onClick={e => e.stopPropagation()}
              ref={popoverRef}
              className="
                absolute rounded shadow bg-white p-3 z-10 border border-gray-400
                font-sans whitespace-no-wrap
              "
            >
              <p>
                <span className="font-greek">{selectedWord.lemma}</span>{' '}
                <span className="font-bold text-xs ml-1">{speechMap[selectedWord.speech].toUpperCase()}</span>
              </p>
              <p className="text-sm">{convertCodeToParsing(selectedWord.parsing)}</p>
            </div>
          }
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
