import { useEffect, useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { PhraseDispatch } from "./usePhrase"

const INDENT_SIZE = 32
const LINE_HEIGHT = 32

interface PhraseLineProps {
  lineId: number
  text: string
  index: number,
  indent: number
  isFocused: boolean
  dispatch: PhraseDispatch
  onFocus?(): void
  onBlur?(): void
}

interface DragState {
  mouse: { x: number, y: number }
  indent: number
  index: number
}

const PhraseLine: React.FC<PhraseLineProps> = ({ lineId, text, index, indent, isFocused, dispatch, onFocus, onBlur }) => {
  const [dragState, setDragState] = useState<DragState>()


  useEffect(() => {
    if (dragState) {
      const moveHandler = (e: PointerEvent) => {
        if (e.isPrimary) {
          // console.log(new Date(), e.clientX, e.clientY)
          const dx = e.clientX - dragState.mouse.x
          const dy = e.clientY - dragState.mouse.y
          const dIndent = Math.round(dx / INDENT_SIZE)
          const dIndex = Math.round(dy / LINE_HEIGHT)
          const newIndent = dragState.indent + dIndent
          const newIndex = dragState.index + dIndex
          // console.log('move', dragState.index, newIndex)
          if (newIndent !== indent) {
            dispatch({
              type: 'indent-line',
              lineId,
              indent: newIndent
            })
          }
          if (newIndex !== index) {
            dispatch({
              type: 'move-line',
              lineId,
              index: newIndex
            })
          }
        }
      }
      window.addEventListener('pointermove', moveHandler)
      return () => {
        window.removeEventListener('pointermove', moveHandler)
      }
    }
  }, [dragState, indent, index, dispatch])

  useEffect(() => {
    if (dragState) {
      const stopHandler = (e: PointerEvent) =>
        e.isPrimary && setDragState(undefined)
      window.addEventListener('pointerup', stopHandler)
      window.addEventListener('pointercancel', stopHandler)
      return () => {
        window.removeEventListener('pointerup', stopHandler)
        window.removeEventListener('pointercancel', stopHandler)
      }
    }
  }, [dragState])

  return (
    <div>
      <div
        className="relative flex h-8 items-center focus:outline-none"
        style={{ paddingLeft: INDENT_SIZE * indent}}
        tabIndex={-1}
        onFocus={e => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            onFocus?.()
          }
        }}
        onBlur={e => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            onBlur?.()
          }
        }}
      >
        <div
          className={`
            absolute inset-0 z-0
            ${isFocused ? 'bg-gray-400' : ''}
          `}
        />
        <div
          className={`
            w-12 h-12 flex items-center justify-center z-10
            cursor-pointer select-none scroll-none
          `}
          onPointerDown={e => {
            if (e.isPrimary) {
              setDragState({
                mouse: { x: e.clientX, y: e.clientY },
                indent,
                index
              })
            }
          }}
        >
          <FontAwesomeIcon className="text-xl" icon="grip-horizontal" />
        </div>
        <div
          className={`flex items-center z-10 pr-3`}
        >
          {text}
        </div>
      </div>
    </div>
  )
}

export default PhraseLine