import produce, { Draft } from "immer"

export interface PhraseLine {
  id: number
  text: string
  indent: number
}

export type PhraseData = PhraseLine[]

export interface IndentLineAction {
  lineId: number
  indent: number
}

export const indentLine = produce((lines: Draft<PhraseData>, { lineId, indent }: IndentLineAction) => {
  const originalLine = lines.find(line => line.id === lineId)
  if (!originalLine) {
    throw new Error(`No line with id ${lineId}`)
  }
  originalLine.indent = Math.max(0, indent)
})

export enum LineMoveDirection {
  Up,
  Down
}

export interface MoveLineAction {
  lineId: number,
  index: number
}

export const moveLine = produce((lines: Draft<PhraseData>, { lineId, index }: MoveLineAction) => {
  const lineIndex = lines.findIndex(line => line.id === lineId)
  if (lineIndex < 0) {
    throw new Error(`No line with id ${lineId}`)
  }
  const correctedIndex = Math.max(0, Math.min(lines.length - 1, index))
  const originalLine = lines[lineIndex]
  lines.splice(lineIndex, 1)
  lines.splice(correctedIndex, 0, originalLine)
})