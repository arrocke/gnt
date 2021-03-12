import { Fragment, useEffect, useState } from "react"
import { UsePhraseDispatch } from "./usePhrase"

const INDENT_PX = 16

interface MoveWordDropSiteProps {
  line: number
  word: number
  dispatch: UsePhraseDispatch
}

const MoveWordDropSite: React.FC<MoveWordDropSiteProps> = ({ word, line, dispatch }) => {
  const [isHovering, setHovering] = useState(false)

  return <span className="inline-block align-text-top mx-2px w-0">
    <span
      className="relative flex justify-center w-6 h-5 -ml-3 focus:outline-none"
      onDragOver={e => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
      }}
      onDrop={e => {
        e.preventDefault()
        const data: { word: number, line: number } = JSON.parse(e.dataTransfer.getData('application/x.word'))
        dispatch({
          type: 'move-word',
          word: data.word,
          line: data.line,
          targetWord: word,
          targetLine: line
        })
      }}
      onDragEnter={e => {console.log('enter', line, word); setHovering(true)}}
      onDragLeave={e => {console.log('leave', line, word); setHovering(false)}}
    >
      <span className={`w-1 h-5 bg-red-700 ${isHovering ? '' : 'hidden'}`}/>
    </span>
  </span>
}

interface PhraseLineProps {
  index: number
  text: string
  indent: number
  dispatch: UsePhraseDispatch
}

const PhraseLine: React.FC<PhraseLineProps> = ({ index, text, indent, dispatch }) => {
  const [draggingWord, setDraggingWord] = useState<number>()
  const words = text.split(' ')

  return <div
    className="flex items-start"
    style={{ marginLeft: `${indent * INDENT_PX}px`}}
  >
    {words.map((text, i) =>
      <Fragment key={i}>
        {draggingWord === i ? null : <MoveWordDropSite line={index} word={i} dispatch={dispatch}/>}
        <span
          ref={console.log}
          className={draggingWord === i ? 'hidden' : ''}
          draggable
          onDragStart={e => {
            e.dataTransfer.setData("application/x.word", JSON.stringify({
              line: index,
              word: i,
              text
            }))
            e.dataTransfer.dropEffect = "move"
            // This allows the DnD API capture the drag image of the word before we hide it.
            setTimeout(() => {
              setDraggingWord(i)
            })
          }}
          onDragEnd={e => {
            setDraggingWord(undefined)
          }}
        >
          {text}
        </span>
      </Fragment>
    )}
    <MoveWordDropSite line={index} word={words.length} dispatch={dispatch}/>
  </div>
}

export default PhraseLine
