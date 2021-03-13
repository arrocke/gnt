import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react"
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
  const rootElement = useRef<HTMLDivElement>(null)
  const [dragState, setDragState] = useState<DragState>()
  const [focusedBreak, setFocusedBreak] = useState<number | undefined>(undefined)
  const words = text.split(' ')

  useLayoutEffect(() => {
    setFocusedBreak(undefined)
  }, [text])

  useLayoutEffect(() => {
    if (isFocused) {
      rootElement.current?.focus()
    }
  }, [isFocused, focusedBreak])

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
              lineIndex: newIndex
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
        ref={rootElement}
        className="relative flex items-start min-h-8 focus:outline-none"
        style={{ paddingLeft: INDENT_SIZE * indent}}
        tabIndex={-1}
        onPointerDown={() => {
          if (!isFocused) {
            onFocus?.() 
          }
        }}
        onFocus={e => {
          if (!e.currentTarget.contains(e.relatedTarget as Node) && !isFocused) {
            onFocus?.()
          }
        }}
        onBlur={e => {
          if (!e.currentTarget.contains(e.relatedTarget as Node) && isFocused) {
            onBlur?.()
          }
        }}
        onKeyDown={e => {
          let handled = false
          switch(e.key) {
            case 'ArrowUp':
              if (e.shiftKey) {
                handled = true
                dispatch({ type: 'move-line', lineId, lineIndex: index - 1 })
              }
              break
            case 'ArrowDown':
              if (e.shiftKey) {
                handled = true
                dispatch({ type: 'move-line', lineId, lineIndex: index + 1 })
              }
              break
            case 'ArrowRight':
              handled = true
              if (e.shiftKey) {
                dispatch({ type: 'indent-line', lineId, indent: indent + 1 })
              } else {
                if (typeof focusedBreak === 'number')
                  setFocusedBreak(focusedBreak + 2 < words.length ? focusedBreak + 1 : undefined)
                else
                  setFocusedBreak(0)
              }
              break
            case 'ArrowLeft':
              handled = true
              if (e.shiftKey) {
                dispatch({ type: 'indent-line', lineId, indent: indent - 1 })
              } else {
                if (typeof focusedBreak === 'number')
                  setFocusedBreak(focusedBreak === 0 ? undefined : focusedBreak - 1)
                else
                  setFocusedBreak(words.length - 2)
              }
              break
            case 'Tab':
              handled = true
              dispatch({ type: 'indent-line', lineId, indent: indent + (e.shiftKey ? -1 : 1) })
              break
            case 'Enter':
              if (focusedBreak) {
                handled = true
                dispatch({ type: 'split-line', lineId: lineId, wordIndex: focusedBreak })
              }
          }
          if (handled) {
            e.stopPropagation()
            e.preventDefault()
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
            w-12 h-12 -my-2 flex items-center justify-center z-10
            cursor-pointer select-none scroll-none
            flex-shrink-0
          `}
          onPointerDown={e => {
            if (e.isPrimary) {
              setDragState({ mouse: { x: e.clientX, y: e.clientY }, indent, index })
            }
          }}
        >
          <FontAwesomeIcon className="text-xl" icon="grip-horizontal" />
        </div>
        <div
          className={`flex items-center py-1 z-10 pr-3 flex-wrap`}
        >
          {words.map((word, i) => (
            <Fragment key={i}>
              {word}
              {i + 1 === words.length
                ? null
                : (
                  <button
                    data-id="line-break"
                    tabIndex={-1}
                    className="group relative w-1 h-8 -my-1 focus:outline-none"
                    onClick={() => {
                      dispatch({ type: 'split-line', lineId: lineId, wordIndex: i })
                      rootElement.current?.focus()
                    }}
                  >
                    <span className="-mx-4 h-full flex justify-center items-center">
                      <span
                        className={`
                          w-1 h-5 group-hover:bg-red-600
                          ${focusedBreak === i ? 'bg-red-600' : '' }
                        `}
                      />
                    </span>
                    <span className="sr-only">Split Line</span>  
                  </button>
                )
              }
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PhraseLine