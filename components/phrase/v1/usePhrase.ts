import { Dispatch, useReducer } from "react"
import produce, { Draft, original } from "immer"
import { listeners } from "process"

export interface PhraseLineData {
  readonly indent: number
  readonly text: string
}

export interface PhraseState {
  readonly lines: readonly PhraseLineData[]
}

interface IndentAction {
  type: 'indent'
  line: number
  indent: number
}

interface SplitAction {
  type: 'split',
  line: number,
  word: number
}

interface MoveWordAction {
  type: 'move-word',
  line: number,
  targetLine: number,
  word: number
  targetWord: number
}

export type PhraseAction = IndentAction | SplitAction | MoveWordAction

const reducer = produce((state: Draft<PhraseState>, action: PhraseAction) => {
  switch(action.type) {
    case 'indent': {
      const originalLine = state.lines[action.line]
      if (!originalLine) {
        throw new Error(`No line at index ${action.line}`)
      }
      originalLine.indent = action.indent
      break
    }
    case 'split': {
      const originalLine = state.lines[action.line]
      if (!originalLine) {
        throw new Error(`No line at index ${action.line}`)
      }
      const words = originalLine.text.split(' ')
      const line1 = words.slice(0, action.word).join(' ')
      const line2 = words.slice(action.word).join(' ')
      state.lines.splice(action.line, 1, 
        { ...originalLine, text: line1 },
        { ...originalLine, text: line2 }
      )
      break
    }
    case 'move-word': {
      const originalLine = state.lines[action.line]
      if (!originalLine) {
        throw new Error(`No line at index ${action.line}`)
      }
      const targetLine = state.lines[action.targetLine]
      if (!targetLine) {
        throw new Error(`No line at index ${action.targetLine}`)
      }
      const words = originalLine.text.split(' ')
      const targetWords = originalLine === targetLine ? words : targetLine.text.split(' ')
      const word = words.splice(action.word, 1)
      targetWords.splice(action.targetWord, 0, word[0])
      originalLine.text = words.join(' ')
      targetLine.text = targetWords.join(' ')
      break
    }
    default:
      throw new Error(`${action!.type} is not a valid action`)
  }
})

export type UsePhraseDispatch = Dispatch<PhraseAction>

export type UsePhraseResult = [PhraseState, UsePhraseDispatch]

export function usePhrase(phrase: any): UsePhraseResult {
  const [state, dispatch] = useReducer(reducer, { lines: phrase })
  return [state, dispatch]
}