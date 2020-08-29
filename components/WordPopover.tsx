import { Text } from "@prisma/client"
import { forwardRef } from "react"

interface WordPopoverProps {
  word?: Text
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

const WordPopover = forwardRef<HTMLDivElement, WordPopoverProps>(({ word }, ref) => {
  return word ? (<div
    onClick={e => e.stopPropagation()}
    ref={ref}
    className="
      absolute rounded shadow bg-white p-3 z-10 border border-gray-400
      font-sans whitespace-no-wrap
    "
  >
    <p>
      <span className="font-greek">{word.lemma}</span>{' '}
      <span className="font-bold text-xs ml-1">{speechMap[word.speech].toUpperCase()}</span>
    </p>
    <p className="text-sm">{convertCodeToParsing(word.parsing)}</p>
  </div>) : null
})
WordPopover.displayName = 'WordPopover'

export default WordPopover