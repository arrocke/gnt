import { Fragment } from "react"

const INDENT_PX = 16

interface PhraseState {
  readonly lines: readonly {
    indent: number
    text: string
  }[]
}

export interface MoveWordsPhraseProps {
  phrase: PhraseState
  onPhraseChange(phrase: PhraseState): void
}

const MoveWordsPhrase: React.FC<MoveWordsPhraseProps> = ({ phrase, onPhraseChange }) => {
  return <div>
    {phrase.lines.map((props, lineIndex) =>
      <MoveWordsPhraseLine
        key={lineIndex}
        {...props}
      />
    )}
  </div>
}

interface MoveWordsPhraseLineProps {
  text: string
  indent: number
}

const MoveWordsPhraseLine: React.FC<MoveWordsPhraseLineProps> = ({ text, indent }) => {
  const words = text.split(' ')

  return <div
    className="flex items-start"
    style={{ marginLeft: `${indent * INDENT_PX}px`}}
  >
    {words.map((word, i) =>
      <Fragment key={i}>
        <span>{word}</span>
      </Fragment>
    )}
  </div>
}

export default MoveWordsPhrase