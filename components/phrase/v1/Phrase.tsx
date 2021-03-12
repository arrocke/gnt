import React, { useState } from "react"
import IndentPhrase from "./IndentPhrase"
import MoveWordsPhrase from "./MoveWordsPhrase"

export interface PhraseProps {
  phrase: any
}

type PhraseToolType = 'indent' | 'move-word'

const Phrase: React.FC<PhraseProps> = ({ phrase: initialPhrase }) => {
  const [tool, selectTool] = useState<PhraseToolType>('indent')
  const [phrase, setPhrase] = useState({ lines: initialPhrase })

  return <div className="p-4">
    <div className="mb-4">
      <button
        className={`text-blue-700 mx-2 ${tool === 'indent' ? 'font-bold' : ''}`}
        onClick={() => selectTool('indent')}
      >
        Indent
      </button>
      <button
        className={`text-blue-700 mx-2 ${tool === 'move-word' ? 'font-bold' : ''}`}
        onClick={() => selectTool('move-word')}
      >
        Move Words
      </button>
    </div>
    { tool === 'indent' ? <IndentPhrase phrase={phrase} onPhraseChange={setPhrase} /> : null }
    { tool === 'move-word' ? <MoveWordsPhrase phrase={phrase} onPhraseChange={setPhrase} /> : null }
  </div>
}

export default Phrase