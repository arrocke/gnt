import { Fragment, useEffect, useState } from "react"
import produce, { Draft } from "immer"

const INDENT_PX = 16

interface PhraseState {
  readonly lines: readonly {
    indent: number
    text: string
  }[]
}

interface SplitAction {
  lineIndex: number,
  wordIndex: number
}

const split = produce((state: Draft<PhraseState>, { lineIndex, wordIndex }: SplitAction) => {
  const originalLine = state.lines[lineIndex]
  if (!originalLine) {
    throw new Error(`No line at index ${lineIndex}`)
  }
  const words = originalLine.text.split(' ')
  const line1 = words.slice(0, wordIndex + 1).join(' ')
  const line2 = words.slice(wordIndex + 1).join(' ')
  state.lines.splice(lineIndex, 1, 
    { ...originalLine, text: line1 },
    { ...originalLine, text: line2 }
  )
})

interface IndentAction {
  lineIndex: number
  indentSize: number
}

const indent = produce((state: Draft<PhraseState>, { lineIndex, indentSize }: IndentAction) => {
  const originalLine = state.lines[lineIndex]
  if (!originalLine) {
    throw new Error(`No line at index ${lineIndex}`)
  }
  originalLine.indent = indentSize
})

export interface IndentPhraseProps {
  phrase: PhraseState
  onPhraseChange(phrase: PhraseState): void
}

const IndentPhrase: React.FC<IndentPhraseProps> = ({ phrase, onPhraseChange }) => {
  return <div>
    {phrase.lines.map((props, lineIndex) =>
      <IndentPhraseLine
        key={lineIndex}
        {...props}
        onSplit={wordIndex => onPhraseChange(split(phrase, { wordIndex, lineIndex }))}
        onIndent={indentSize => onPhraseChange(indent(phrase, { indentSize, lineIndex }))}
      />
    )}
  </div>
}

interface IndentPhraseLineProps {
  text: string
  indent: number
  onSplit(wordIndex: number): void
  onIndent(indent: number): void
}

const IndentPhraseLine: React.FC<IndentPhraseLineProps> = ({ text, indent, onIndent, onSplit }) => {
  const [dragState, setDragState] = useState<{ mouse: number, indent: number }>()
  const words = text.split(' ')

  // Drag handlers on window for indenting lines.
  useEffect(() => {
    if (dragState) {
      const moveHandler = (e: MouseEvent) => {
        const dx = e.clientX - dragState.mouse
        const dIndent = Math.round(dx / INDENT_PX)
        const newIndent = Math.max(0, dragState.indent + dIndent)
        onIndent(newIndent)
      }
      const stopHandler = () => {
        setDragState(undefined)
      }
      window.addEventListener('mousemove', moveHandler)
      window.addEventListener('mouseup', stopHandler)
      return () => {
        window.removeEventListener('mousemove', moveHandler)
        window.removeEventListener('mouseup', stopHandler)
      }
    }
  }, [dragState])


  return <div
    className="flex items-start"
    style={{ marginLeft: `${indent * INDENT_PX}px`}}
  >
    <span
      className="mr-2 select-none cursor-pointer"
      onMouseDown={e => {
        setDragState({ mouse: e.clientX, indent })
      }}
    >
      Drag
    </span>
    <span className="inline-block">
      {words.map((word, i) =>
        <Fragment key={i}>
          <span>{word}</span>
          {i + 1 < words.length
            ? <span className="inline-block align-text-top mx-2px w-0" >
                <button
                  className="group relative flex justify-center w-6 -ml-3 focus:outline-none"
                  onClick={() => {
                    const line1 = words.slice(0, i + 1).join(' ')
                    const line2 = words.slice(i + 1).join(' ')
                    onSplit(i)
                  }}
                >
                  <span className="w-1 h-5 group-hover:bg-red-700 group-focus:bg-red-700"/>
                </button>
              </span>
            : null
          }
        </Fragment>
      )}
    </span>
  </div>
}

export default IndentPhrase
