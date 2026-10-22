import type { ReactNode } from 'react'

import ListingsProvider from './ListingsProvider'
import SelectionProvider from './SelectionProvider'
import TravelProvider from './TravelProvider'

/** All app state. Read it with `useListings`, `useSelection` and `useTravel`. */
export default function AppProvider({ children }: { children: ReactNode }) {
  return (
    <ListingsProvider>
      <SelectionProvider>
        <TravelProvider>{children}</TravelProvider>
      </SelectionProvider>
    </ListingsProvider>
  )
}
