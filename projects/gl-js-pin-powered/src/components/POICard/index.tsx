import React, { useState, useEffect } from 'react'

import { useFavourites, useVisited, useCategory } from '../../hooks/useAppState'
import { getDetails } from '../../api/getDetails'

import loaderStyles from './Loader.module.css'
import styles from './POICard.module.css'

interface POICardProps {
  selectedFeature: mapboxgl.TargetFeature | null
  onClose: () => void
  onFavouriteChange: () => void
}

type Details = {
  name?: string
  full_address?: string
  maki?: string
  metadata: {
    phone?: string
    website?: string
    primary_photo?: string
    detailed_description?: string
  }
}

export const POICard: React.FC<POICardProps> = ({
  selectedFeature,
  onClose,
  onFavouriteChange
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [details, setDetails] = useState<Details | null>(null)
  const [featureId, setFeatureId] = useState<number | null>(null)
  const [isFavourited, setIsFavourited] = useState(false)

  const { favouritesSet, addFavourite, removeFavourite } = useFavourites()
  const { addVisited } = useVisited()
  const { categoryRef } = useCategory()

  const handleFavouriteClick = () => {
    if (!featureId) return

    const newFavourited = !isFavourited
    if (newFavourited) {
      addFavourite(featureId)
    } else {
      removeFavourite(featureId)
    }
    setIsFavourited(newFavourited)
    onFavouriteChange()
  }

  const handleClose = () => {
    setDetails(null)
    setFeatureId(null)
    setIsFavourited(false)
    onClose()
  }

  const fetchDetails = async (mapboxId: string) => {
    setIsLoading(true)
    try {
      const { properties: detailsData } = await getDetails(mapboxId)
      setDetails(detailsData)
    } catch (error) {
      console.error('Failed to fetch details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Update when selectedFeature changes
  useEffect(() => {
    if (selectedFeature) {
      const id = Number(selectedFeature.id)
      addVisited(id)
      setFeatureId(id)
      setIsFavourited(favouritesSet.has(id))
      fetchDetails(String(selectedFeature.properties.mapbox_id))

      // Hide filters on small screens
      const smallScreen = window.matchMedia('(max-width: 768px)')
      if (smallScreen.matches) {
        const filtersContainer = document.querySelector(
          '.filters__container'
        ) as HTMLElement
        if (filtersContainer) filtersContainer.classList.add('hidden')
      }
    } else {
      setDetails(null)
      setFeatureId(null)
      setIsFavourited(false)
    }
  }, [addVisited, favouritesSet, selectedFeature])

  if (!selectedFeature) return null

  const featureName =
    details?.name || (selectedFeature.properties.name as string) || 'Unknown'
  const featureAddress =
    details?.full_address || selectedFeature.properties.address || ''

  return (
    <div
      className='poiCard'
      data-opened={!!selectedFeature}
      data-favourite={isFavourited}
    >
      <div className={styles.content}>
        <div className={styles.handlerContainer}>
          <div className={styles.handler}></div>
        </div>

        <header className={styles.header}>
          <div className={styles.headerContent}>
            {categoryRef.current === 'food_and_drink' && details?.maki && (
              <img
                className={styles.image}
                src={`${details.maki}.svg`}
                alt={featureName}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            )}
            <h2 className={styles.name}>{featureName}</h2>
          </div>
          <div className={styles.closeContainer}>
            <button
              className={styles.close}
              aria-label='Close'
              title='Close'
              onClick={handleClose}
            ></button>
          </div>
        </header>

        <main className={styles.main}>
          <div className={styles.addressLine}>
            <div className={styles.details}>
              <img src='pin.svg' className={styles.detailsIcon} alt='Pin' />
              <span className={styles.detailsLabel}>{featureAddress}</span>
            </div>
            <button
              className={styles.favouriteButton}
              aria-label='Add to favourites'
              title='Add to favourites'
              onClick={handleFavouriteClick}
            ></button>
          </div>

          {isLoading ? (
            <div className={styles.loaderContainer}>
              <div
                className={loaderStyles.spinner}
                style={{ width: '24px', height: '24px' }}
              ></div>
            </div>
          ) : (
            <>
              {details?.metadata?.phone && (
                <div className={styles.details}>
                  <img
                    src='phone.svg'
                    className={styles.detailsIcon}
                    alt='Phone'
                  />
                  <span className={styles.detailsLabel}>
                    {details.metadata.phone}
                  </span>
                </div>
              )}

              {details?.metadata?.website && (
                <div className={styles.details}>
                  <img
                    src='website.svg'
                    className={styles.detailsIcon}
                    alt='Website'
                  />
                  <a
                    href={details.metadata.website}
                    className={`${styles.detailsLabel} ${styles.website}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    title={details.metadata.website}
                  >
                    {details.metadata.website}
                  </a>
                </div>
              )}

              {details?.metadata?.primary_photo && (
                <div className={styles.details}>
                  <img
                    src={details.metadata.primary_photo}
                    className={styles.detailsPhoto}
                    alt={`Photo of ${featureName}`}
                  />
                </div>
              )}

              {details?.metadata?.detailed_description && (
                <div className={styles.details}>
                  <p className={styles.detailsDescription}>
                    {details.metadata.detailed_description}
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
