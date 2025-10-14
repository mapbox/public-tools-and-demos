import React, { useState, useCallback, useMemo } from 'react'
import debounce from 'lodash.debounce'
import { getSuggestions } from '../../api/getSuggestions'
import { useSearch, useFilters, useMap } from '../../hooks/useAppState'

import styles from './Filters.module.css'

import restaurantIcon from '../../assets/restaurant.svg'
import barIcon from '../../assets/bar.svg'
import cafeIcon from '../../assets/cafe.svg'
import fastFoodIcon from '../../assets/fast-food.svg'
import nightclubIcon from '../../assets/nightclub.svg'
import specialtyShopIcon from '../../assets/specialty-shop.svg'

const SUB_CATEGORIES = [
  'restaurant',
  'bar',
  'cafe',
  'fast_food',
  'nightclub',
  'specialty_shop'
]

const SUB_CATEGORIES_ICONS: Record<string, string> = {
  restaurant: restaurantIcon,
  bar: barIcon,
  cafe: cafeIcon,
  fast_food: fastFoodIcon,
  nightclub: nightclubIcon,
  specialty_shop: specialtyShopIcon
}

const humanReadableCategories = SUB_CATEGORIES.map((cat) => {
  return [
    cat,
    cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    SUB_CATEGORIES_ICONS[cat]
  ] as [string, string, string]
})

interface FiltersControlProps {
  isHidden?: boolean
}

export const Filters: React.FC<FiltersControlProps> = ({
  isHidden = false
}) => {
  const { mapRef } = useMap()
  const [query, setQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const { setSearchQuery } = useSearch()
  const { updateGlobalFilter } = useFilters()

  const performSearch = useCallback(
    async (searchText: string) => {
      if (!mapRef.current) return

      const trimmedQuery = searchText.trim()
      setSearchQuery(trimmedQuery)

      if (!trimmedQuery) {
        updateGlobalFilter(mapRef.current, 'search')
        return
      }

      try {
        const { features: suggestions } = await getSuggestions(
          mapRef.current,
          searchText
        )
        const mapboxIds = suggestions.map(
          (f: { properties: { mapbox_id: string } }) => f.properties.mapbox_id
        )
        updateGlobalFilter(mapRef.current, 'search', [
          'in',
          ['get', 'mapbox_id'],
          ['literal', mapboxIds]
        ])
      } catch (error) {
        console.error('Search failed:', error)
      }
    },
    [mapRef, updateGlobalFilter, setSearchQuery]
  )

  const debouncedSearch = useMemo(
    () => debounce(performSearch, 300),
    [performSearch]
  )

  const handleSearch = useCallback(
    (searchText: string) => {
      setQuery(searchText)
      debouncedSearch(searchText)
    },
    [debouncedSearch]
  )

  const handleCategoryChange = useCallback(
    (category: string, checked: boolean) => {
      if (!mapRef.current) return

      const newCategories = checked
        ? [...selectedCategories, category]
        : selectedCategories.filter((cat) => cat !== category)

      setSelectedCategories(newCategories)

      if (newCategories.length > 0) {
        updateGlobalFilter(mapRef.current, 'sub_categories', [
          'in',
          ['get', 'sub_category'],
          ['literal', newCategories]
        ])
      } else {
        updateGlobalFilter(mapRef.current, 'sub_categories')
      }
    },
    [mapRef, selectedCategories, updateGlobalFilter]
  )

  // Handle map moveend for search
  React.useEffect(() => {
    if (!mapRef.current || !query) return

    const handleMoveEnd = async () => {
      if (!mapRef.current) return
      try {
        const { features: suggestions } = await getSuggestions(
          mapRef.current,
          query
        )
        const mapboxIds = suggestions.map(
          (f: { properties: { mapbox_id: string } }) => f.properties.mapbox_id
        )
        updateGlobalFilter(mapRef.current, 'search', [
          'in',
          ['get', 'mapbox_id'],
          ['literal', mapboxIds]
        ])
      } catch (error) {
        console.error('Search update failed:', error)
      }
    }

    const map = mapRef.current

    map.on('moveend', handleMoveEnd)
    return () => {
      if (!map) return
      map.off('moveend', handleMoveEnd)
    }
  }, [mapRef, query, updateGlobalFilter])

  return (
    <div className={`${styles.filters} ${isHidden ? 'hidden' : ''}`}>
      <div className={styles.container}>
        {humanReadableCategories.map(([cat, human, svg]) => (
          <label key={cat} className={styles.filterLabel} tabIndex={0}>
            <input
              tabIndex={-1}
              name={cat}
              type='checkbox'
              className={styles.filterCheckbox}
              value={cat}
              checked={selectedCategories.includes(cat)}
              onChange={(e) => handleCategoryChange(cat, e.target.checked)}
            />
            <span className={styles.filterButton}>
              <div className={styles.filterIcon}>
                <img src={svg} alt={`${human} icon`} />
              </div>
              <span>{human}</span>
            </span>
          </label>
        ))}
      </div>
      <div className={styles.searchBox}>
        <div className={styles.searchBoxWrapper}>
          <input
            className={styles.searchBoxInput}
            name='search'
            type='text'
            placeholder='Search'
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
