import { ResetIcon } from '@radix-ui/react-icons'
import IconButton from './IconButton'

interface ResetButtonProps {
  onReset: () => void
  title?: string
}

export default function ResetButton({
  onReset,
  title = 'Reset to default'
}: ResetButtonProps) {
  return (
    <IconButton onClick={onReset} title={title} size='xs'>
      <ResetIcon className='w-2.5 h-2.5' />
    </IconButton>
  )
}
