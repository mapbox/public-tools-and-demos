interface IconButtonProps {
  onClick?: () => void
  children: React.ReactNode
  title?: string
  type?: 'button' | 'submit' | 'reset'
  size?: 'xs' | 'small' | 'normal'
}

export default function IconButton({
  onClick,
  children,
  title,
  type = 'button',
  size = 'normal'
}: IconButtonProps) {
  const sizeClasses =
    size === 'xs' ? 'w-4 h-4' : size === 'small' ? 'w-5 h-5' : 'w-8 h-8'

  return (
    <button
      type={type}
      onClick={onClick}
      title={title}
      className={`${sizeClasses} shrink-0 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center cursor-pointer text-gray-600 px-0`}
    >
      {children}
    </button>
  )
}
