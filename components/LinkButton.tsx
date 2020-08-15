import { ComponentProps, forwardRef } from "react"

const LinkButton = forwardRef<HTMLAnchorElement, ComponentProps<"a">>(({ className = '', ...props }, ref) => {
  return <a
    ref={ref}
    className={`
      inline-block h-11 bg-black text-white font-bold border border-black
      px-4 py-3 rounded shadow leading-tight text-center
      focus:outline-none focus:shadow-outline
      ${className}
    `}
    {...props}
  />
})
LinkButton.displayName = 'LinkButton'

export default LinkButton