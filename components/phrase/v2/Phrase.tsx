import { useState } from "react"
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
        let handled = true
        switch(e.key) {
          case 'Enter':
            setFocusState(FocusState.Active)
            break
          case 'Escape':
            setFocusState(FocusState.Focused)
            break
          case 'ArrowUp':
            if (focusState === FocusState.Active) {
              if (e.shiftKey) {
                dispatch({
                  type: 'move-line',
                  lineId: focusedLine.id,
                  index: focusedIndex - 1
                })
              } else {
                moveFocus(-1)
              }
            }
            break
          case 'ArrowDown':
            if (focusState === FocusState.Active) {
              if (e.shiftKey) {
                dispatch({
                  type: 'move-line',
                  lineId: focusedLine.id,
                  index: focusedIndex + 1
                })
              } else {
                moveFocus(1)
              }
            }
            break
          case 'ArrowRight':
            if (focusState === FocusState.Active && e.shiftKey) {
              dispatch({
                type: 'indent-line',
                lineId: focusedLine.id,
                indent: focusedLine.indent + 1
              })
            }
            break
          case 'ArrowLeft':
            if (focusState === FocusState.Active && e.shiftKey) {
              dispatch({
                type: 'indent-line',
                lineId: focusedLine.id,
                indent: focusedLine.indent - 1
              })
            }
            break
          case 'Tab':
            if (focusState === FocusState.Active) {
              dispatch({
                type: 'indent-line',
                lineId: focusedLine.id,
                indent: focusedLine.indent + (e.shiftKey ? -1 : 1)
              })
            } else {
              handled = false
            }
            break
          default:
            handled = false
        }
        if (handled) {
          e.preventDefault()
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