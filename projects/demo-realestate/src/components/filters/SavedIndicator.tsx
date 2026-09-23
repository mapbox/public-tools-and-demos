import heartActive from '../../img/icons/heart-active.svg'
import heartSaved from '../../img/icons/heart-saved.svg'

/**
 * Sits at the far right of the filter bar, deliberately outside the filter
 * group, because saved homes are a destination rather than a filter. Rendered
 * as a count for now — it becomes the entry point once the Favorites view
 * exists, which is not yet built.
 */
export default function SavedIndicator({ count }: { count: number }) {
  const hasSaved = count > 0

  return (
    <span className='flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-ink-muted'>
      <img
        src={hasSaved ? heartActive : heartSaved}
        alt=''
        width={18}
        height={18}
      />
      Saved ({count})
    </span>
  )
}
