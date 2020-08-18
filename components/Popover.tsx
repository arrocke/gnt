export interface PopoverProps {
  visible?: boolean
  className?: string
}

const Popover: React.FC<PopoverProps> = ({ children, className = '', visible = false }) => {
  if (visible) {
    return <div
      className={`
        absolute rounded shadow bg-white p-3 z-10 border border-gray-400
        ${className}
      `}
    >
      {children}
    </div>
  } else {
    return null
  }
}

export default Popover