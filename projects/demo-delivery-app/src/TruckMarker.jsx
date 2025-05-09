import { useEffect, useRef } from "react"
import { createPortal } from "react-dom";

import mapboxgl from 'mapbox-gl'

import { ORIGIN_COORDINATES } from "./App";

const Marker = ({ map, onMove }) => {
  const markerRef = useRef()
  const contentRef = useRef(document.createElement("div"));


  const handleDragEnd = () => {
    const lngLat = markerRef.current.getLngLat()
    onMove({
      type: 'Point',
      coordinates: [lngLat.lng, lngLat.lat],
    })
  }

  useEffect(() => {
    if (!map) return
    markerRef.current = new mapboxgl.Marker(contentRef.current, {
      className: 'truck-marker',
      draggable: true,
      anchor: 'bottom',
    })
      .setLngLat(ORIGIN_COORDINATES)
      .addTo(map)

    markerRef.current.on('dragend', handleDragEnd)



  }, [])

  return (
    <>
      {createPortal(
        <div className="flex flex-col items-center leading-none">
        <div
          className="w-20 h-[38px] bg-cover bg-no-repeat"
          style={{ backgroundImage: "url('/demo-delivery-app/img/truck-icon.png')" }}
        />
        <div className="w-0.5 h-5 bg-gray-600" />
      </div>,
        contentRef.current
      )}
    </>
  );

}

export default Marker