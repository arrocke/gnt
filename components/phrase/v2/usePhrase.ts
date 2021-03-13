import produce, { castDraft, Draft } from "immer"
import { Dispatch, useEffect, useReducer } from "react"

interface MutablePhraseLine {
  id: number
  text: string
  indent: number
}

export type PhraseLine = Readonly<MutablePhraseLine>

export type PhraseState = {
  lines: readonly PhraseLine[]
}

export interface ResetAction {
  type: 'reset',
  phrase: Readonly<PhraseLine[]>
}

export interface IndentLineAction {
  type: 'indent-line'
  lineId: number
  indent: number
}

export interface MoveLineAction {
  type: 'move-line'
  lineId: number
  index: number
}

export type PhraseAction = ResetAction | IndentLineAction | MoveLineAction

function findLineById({ lines }: PhraseState, lineId: number): { line: MutablePhraseLine, index: number } {
  const index = lines.findIndex(line => line.id === lineId)
  if (index < 0) {
    throw new Error(`No line with id ${lineId}`)
  }
  return { index, line: lines[index] }
}

const reducer = produce((state: Draft<PhraseState>, action: PhraseAction) => {
  switch(action.type) {
    case 'reset':
      state.lines = castDraft(action.phrase)
      break
    case 'indent-line': {
      const { line } = findLineById(state, action.lineId)
      line.indent = Math.max(0, action.indent)
      break
    }
    case 'move-line': {
      const { line, index } = findLineById(state, action.lineId)
      const newIndex = Math.max(0, Math.min(state.lines.length - 1, action.index))
      state.lines.splice(index, 1)
      state.lines.splice(newIndex, 0, line)
      break
    }
    default:
      throw new Error(`${action!.type} is not a valid action`)
  }
})

export interface UsePhraseOptions {
  phrase: Readonly<PhraseLine[]>
}

export type PhraseData = readonly PhraseLine[]
export type PhraseDispatch = Dispatch<PhraseAction>

export interface UsePhrase {
  lines: PhraseData
  dispatch: PhraseDispatch
}

export function usePhrase(options: UsePhraseOptions): UsePhrase {
  const [{ lines }, dispatch] = useReducer(reducer, { lines: [] })

  useEffect(() => {
    if (options.phrase !== lines) {
      dispatch({ type: 'reset', phrase: options.phrase })
    }
  }, [options.phrase])

  return { lines, dispatch }
}
