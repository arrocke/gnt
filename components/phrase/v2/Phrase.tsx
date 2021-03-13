import { useRef, useState } from "react"
import { indentLine, LineMoveDirection, moveLine, PhraseData } from "./phrase-data"
import PhraseLine from "./PhraseLine"

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
  const [lines, setLines] = useState(phrase)
  const [focusedLineId, setFocusedLine] = useState<number>(0)

  const focusedLineIndex = lines.findIndex(line => line.id === focusedLineId)!
  const focusedLine = lines[focusedLineIndex]

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
                setLines(moveLine(lines, { lineId: focusedLineId, index: Math.max(0, focusedLineIndex - 1) }))
              } else {
                const index = focusedLineIndex === 0 ? lines.length - 1 : focusedLineIndex - 1
                setFocusedLine(lines[index].id)
              }
            }
            break
          case 'ArrowDown':
            if (focusState === FocusState.Active) {
              if (e.shiftKey) {
                setLines(moveLine(lines, { lineId: focusedLineId, index: Math.min(lines.length - 1, focusedLineIndex + 1) }))
              } else {
                const index = focusedLineIndex + 1 === lines.length ? 0 : focusedLineIndex + 1
                setFocusedLine(lines[index].id)
              }
            }
            break
          case 'ArrowRight':
            if (focusState === FocusState.Active && e.shiftKey) {
              setLines(indentLine(lines, { lineId: focusedLineId, indent: focusedLine.indent + 1 }))
            }
            break
          case 'ArrowLeft':
            if (focusState === FocusState.Active && e.shiftKey) {
              setLines(indentLine(lines, { lineId: focusedLineId, indent: focusedLine.indent - 1 }))
            }
            break
          case 'Tab':
            if (focusState === FocusState.Active) {
              setLines(indentLine(lines, { lineId: focusedLineId, indent: focusedLine.indent + (e.shiftKey ? -1 : 1) }))
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
          index={i}
          text={line.text}
          indent={line.indent}
          isFocused={focusState === FocusState.Active && line.id === focusedLineId}
          onIndent={indent => setLines(indentLine(lines, { lineId: line.id, indent }))}
          onMove={index => setLines(moveLine(lines, { lineId: line.id, index }))}
          onFocus={() => setFocusedLine(line.id)}
        />
      ))}
    </div>
  )
}

export default Phrase