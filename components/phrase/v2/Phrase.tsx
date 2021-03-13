import { useEffect, useState } from "react"
import PhraseLine from "./PhraseLine"
import { useLineFocus } from "./useLineFocus"
import { usePhrase, PhraseData } from "./usePhrase"

export interface PhraseProps {
  phrase: PhraseData
}

enum FocusState {
  Idle,
  Focused,
  Active
}

const Phrase: React.FC<PhraseProps> = ({ phrase }) => {
  const [focusState, setFocusState] = useState(FocusState.Idle)
  const { lines, dispatch } = usePhrase({ phrase })
  const {
    index: focusedIndex,
    line: focusedLine,
    focusLine,
    moveFocus
  } = useLineFocus(lines)

  return (
    <div
      className="py-4"
      tabIndex={0}
      onFocus={e => 
        !e.currentTarget.contains(e.relatedTarget as Node)
          && setFocusState(e.target === e.currentTarget ? FocusState.Focused : FocusState.Active)
      }
      onBlur={e => !e.currentTarget.contains(e.relatedTarget as Node) && setFocusState(FocusState.Idle)}
      onKeyDown={e => {
        let handled = false
        switch(e.key) {
          case 'Enter':
            if (focusState !== FocusState.Active) {
              handled = true
              setFocusState(FocusState.Active)
            }
            break
          case 'Escape':
            if (focusState !== FocusState.Focused) {
              handled = true
              setFocusState(FocusState.Focused)
            }
            break
          case 'ArrowUp':
            handled = true
            moveFocus(-1)
            break
          case 'ArrowDown':
            handled = true
            moveFocus(1)
            break
        }
        if (handled) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
    >
      {lines.map((line, i) => (
        <PhraseLine
          key={line.id}
          lineId={line.id}
          index={i}
          text={line.text}
          indent={line.indent}
          isFocused={focusState === FocusState.Active && line.id === focusedLine.id}
          dispatch={dispatch}
          onFocus={() => focusLine(line.id)}
        />
      ))}
    </div>
  )
}

export default Phrase