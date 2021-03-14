import { useCallback, useState } from "react";
import { PhraseData, PhraseLine } from "./usePhrase";

export interface UseLineFocus {
  line: PhraseLine
  index: number
  focusLine(lineId: number): void
  moveFocus(delta: number): void
}

export function useLineFocus(phrase: PhraseData): UseLineFocus {
  const [focusedLineId, focusLine] = useState<number>(0)

  const index = phrase.findIndex(line => line.id === focusedLineId)!
  const line = phrase[index]

  const moveFocus = useCallback((delta: number) => {
    let newIndex = index + delta
    if (newIndex < 0) newIndex = phrase.length + newIndex
    if (newIndex >= phrase.length) newIndex = newIndex - phrase.length
    focusLine(phrase[newIndex].id)
  }, [index, phrase])

  return { line, index, focusLine, moveFocus }
}