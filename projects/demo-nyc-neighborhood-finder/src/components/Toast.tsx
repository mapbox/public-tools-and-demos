import { useEffect } from 'react'
import './Toast.css'

type Props = {
  message: string
  onDismiss: () => void
}

export default function Toast({ message, onDismiss }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 6000)
    return () => clearTimeout(timer)
  }, [message, onDismiss])

  return (
    <div className="toast">
      <span className="toast-icon">⚠</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onDismiss} aria-label="Dismiss">✕</button>
    </div>
  )
}
