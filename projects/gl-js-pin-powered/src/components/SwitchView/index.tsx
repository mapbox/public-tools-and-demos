import React, { useState } from 'react'
import { setFavicon } from '../../setFavicon'
import { useCategory } from '../../hooks/useAppState'

import styles from './SwitchView.module.css'

import restaurantsViewIcon from '../../assets/restaurants-view.svg'
import hotelsViewIcon from '../../assets/hotels-view.svg'

interface SwitchViewControlProps {
  onCategoryChange: (category: 'food_and_drink' | 'lodging') => void
}

export const SwitchView: React.FC<SwitchViewControlProps> = ({
  onCategoryChange
}) => {
  const [activeCategory, setActiveCategory] = useState<
    'food_and_drink' | 'lodging'
  >('food_and_drink')
  const { setCategory } = useCategory()

  const handleRestaurantsClick = () => {
    setActiveCategory('food_and_drink')
    setCategory('food_and_drink')
    setFavicon('restaurant.svg')
    onCategoryChange('food_and_drink')
  }

  const handleHotelsClick = () => {
    setActiveCategory('lodging')
    setCategory('lodging')
    setFavicon('hotel.svg')
    onCategoryChange('lodging')
  }

  return (
    <div className={`${styles.switch} mapboxgl-ctrl`}>
      <div className={styles.buttons}>
        <button
          className={styles.button}
          aria-pressed={activeCategory === 'lodging'}
          onClick={handleHotelsClick}
        >
          <img className={styles.icon} src={hotelsViewIcon} alt='Hotels view' />
        </button>
        <div className={styles.divider} />
        <button
          className={styles.button}
          aria-pressed={activeCategory === 'food_and_drink'}
          onClick={handleRestaurantsClick}
        >
          <img
            className={styles.icon}
            src={restaurantsViewIcon}
            alt='Restaurants view'
          />
        </button>
      </div>
    </div>
  )
}
