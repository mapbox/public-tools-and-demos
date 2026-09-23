import { useState } from 'react'
import clsx from 'clsx'
import LogoSVG from 'mapbox-demo-components/src/logo-svg'
import { Tooltip } from 'react-tooltip'

import chevronDown from '../../img/icons/chevron-down.svg'
import { products } from '../../data/products'
import MaskIcon from '../ui/MaskIcon'

/**
 * Keeps the "Learn Mapbox" reveal from `mapbox-demo-components`: the bar stays
 * off-screen until asked for, and each chip opens its notes on click. Only the
 * chip styling follows the new design.
 */
export default function LearnMapbox() {
  const [open, setOpen] = useState(false)

  return (
    <div
      className={clsx(
        'absolute inset-x-0 bottom-0 z-50 transition-transform duration-200',
        open ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      <button
        type='button'
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className='absolute bottom-full right-6 flex cursor-pointer items-center gap-2 rounded-t-lg bg-surface-inverse px-4 py-2 text-sm font-bold text-white'
      >
        <LogoSVG fillColor='white' />
        Learn Mapbox
        <MaskIcon
          src={chevronDown}
          size={18}
          className={clsx('transition-transform', !open && 'rotate-180')}
        />
      </button>

      <div className='flex flex-wrap items-center gap-1.5 border-t border-line bg-surface-sunken px-6 py-3'>
        {products.map((product) => (
          <div key={product.title}>
            <button
              type='button'
              data-tooltip-id={`product-${product.title}`}
              className='flex cursor-pointer items-center gap-1 rounded-full border border-gray-200 bg-white py-2 pl-2 pr-4 text-base font-medium text-ink hover:border-line'
            >
              <LogoSVG fillColor='#23262d' />
              {product.title}
            </button>
            <Tooltip
              id={`product-${product.title}`}
              openOnClick
              place='top-start'
              disableStyleInjection
              className='z-50 w-96 rounded-lg bg-white px-4 py-3 text-sm font-normal !opacity-100'
              style={{ boxShadow: '0px 3px 10px 0px rgba(0, 0, 0, 0.2)' }}
            >
              <p className='mb-2 font-bold text-ink'>{product.title}</p>
              {product.body.map((paragraph) => (
                <p key={paragraph} className='mb-2 text-ink-muted'>
                  {paragraph}
                </p>
              ))}
              <ul>
                {product.links.map((link) => (
                  <li key={link.href} className='ml-3 list-disc'>
                    <a
                      href={link.href}
                      target='_blank'
                      rel='noreferrer'
                      className='font-bold text-brand hover:opacity-50'
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  )
}
