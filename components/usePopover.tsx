import { useCallback, useRef } from "react"
import { createPopper, Instance } from '@popperjs/core'

export default function usePopover() {
  const instance = useRef<Instance | null>(null)
  const popover = useRef<HTMLElement | null>(null)
  const popoverParent = useRef<HTMLElement | null>(null)

  const configurePopper = useCallback(() => {
    if (instance.current) {
      instance.current.destroy()
      instance.current = null
    }

    if (popover.current && popoverParent.current) {
      instance.current = createPopper(popoverParent.current, popover.current)
    }
  }, [])

  const popoverRef = useCallback((el: HTMLElement | null) => {
    popover.current = el
    configurePopper()
  }, [configurePopper])

  const popoverParentRef = useCallback((el: HTMLElement | null) => {
    popoverParent.current = el
    configurePopper()
  }, [configurePopper])

  return { popoverRef, popoverParentRef }
}