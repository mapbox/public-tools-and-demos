import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { SearchBox } from '@mapbox/search-js-react'

const accessToken = import.meta.env.VITE_YOUR_MAPBOX_ACCESS_TOKEN || ''
mapboxgl.accessToken = accessToken

interface MapProps {
  lutBase64: string
  isPickingColor?: boolean
  onColorPicked?: (color: { r: number; g: number; b: number }) => void
}

export default function Map({
  lutBase64,
  isPickingColor = false,
  onColorPicked
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const glRef = useRef<WebGL2RenderingContext | WebGLRenderingContext | null>(
    null
  )
  const [mapReady, setMapReady] = useState(false)
  const [pickerPosition, setPickerPosition] = useState<{
    x: number
    y: number
  } | null>(null)
  const pixelGridRef = useRef<Uint8Array | null>(null)
  const [pixelGrid, setPixelGrid] = useState<Uint8Array | null>(null)

  useEffect(() => {
    if (!mapContainer.current) return
    if (map.current) return

    // @ts-expect-error: @types/mapbox-gl and mapbox-gl both ship types causing Map type conflict
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/standard',
      center: [-74.01297, 40.70644],
      zoom: 15.28,
      pitch: 60,
      hash: true,
      preserveDrawingBuffer: true,
      config: {
        basemap: {
          theme: 'custom',
          'theme-data': lutBase64
        }
      }
    })

    map.current!.on('load', () => setMapReady(true))

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
        glRef.current = null
        setMapReady(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (map.current && lutBase64) {
      map.current.setConfigProperty('basemap', 'theme-data', lutBase64)
    }
  }, [lutBase64])

  useEffect(() => {
    if (!map.current || !mapContainer.current) return

    const mapElement = mapContainer.current
    const mapInstance = map.current

    if (isPickingColor) {
      mapElement.style.cursor = 'none'

      const handleMouseMove = (e: MouseEvent) => {
        const rect = mapElement.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        setPickerPosition({ x: e.clientX, y: e.clientY })

        const canvas = mapInstance.getCanvas()
        if (!glRef.current) {
          glRef.current =
            canvas.getContext('webgl2') || canvas.getContext('webgl')
        }
        const gl = glRef.current

        if (gl) {
          const pixelX = Math.floor(x * window.devicePixelRatio)
          const pixelY = Math.floor(y * window.devicePixelRatio)

          // Read 11x11 grid
          const gridSize = 11
          const halfGrid = Math.floor(gridSize / 2)
          const pixels = new Uint8Array(gridSize * gridSize * 4)

          // WebGL y-coordinate is inverted
          const glY = canvas.height - pixelY - 1

          gl.readPixels(
            pixelX - halfGrid,
            glY - halfGrid,
            gridSize,
            gridSize,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            pixels
          )

          pixelGridRef.current = pixels
          setPixelGrid(pixels)
        }
      }

      const handleClick = () => {
        if (!onColorPicked || !pixelGridRef.current) return

        const gridSize = 11
        const centerPixel = Math.floor(gridSize / 2)

        // Flip Y because WebGL reads bottom-to-top
        const flippedY = gridSize - 1 - centerPixel
        const flippedIndex = (flippedY * gridSize + centerPixel) * 4

        const pixels = pixelGridRef.current

        onColorPicked({
          r: pixels[flippedIndex] / 255,
          g: pixels[flippedIndex + 1] / 255,
          b: pixels[flippedIndex + 2] / 255
        })
      }

      mapElement.addEventListener('mousemove', handleMouseMove)
      mapElement.addEventListener('click', handleClick)

      return () => {
        mapElement.removeEventListener('mousemove', handleMouseMove)
        mapElement.removeEventListener('click', handleClick)
        mapElement.style.cursor = ''
      }
    } else {
      mapElement.style.cursor = ''
    }
  }, [isPickingColor, onColorPicked])

  return (
    <>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {mapReady && map.current && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 10,
            width: 280
          }}
        >
          <SearchBox
            accessToken={accessToken}
            map={map.current}
            mapboxgl={mapboxgl}
            placeholder='Search for a location...'
          />
        </div>
      )}

      {/* Magnified Pixel Picker */}
      {isPickingColor && pickerPosition && pixelGrid && (
        <div
          style={{
            position: 'fixed',
            left: pickerPosition.x + 20,
            top: pickerPosition.y + 20,
            pointerEvents: 'none',
            zIndex: 1000,
            backgroundColor: 'white',
            border: '3px solid #3b82f6',
            borderRadius: '8px',
            padding: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          <div
            style={{
              marginBottom: '4px',
              fontSize: '11px',
              fontWeight: 'bold',
              color: '#333'
            }}
          >
            Click to select pixel
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(11, 16px)',
              gap: '1px',
              backgroundColor: '#ddd'
            }}
          >
            {Array.from({ length: 11 * 11 }).map((_, i) => {
              const x = i % 11
              const y = Math.floor(i / 11)

              // Flip Y because WebGL reads bottom-to-top
              const flippedY = 11 - 1 - y
              const flippedIndex = (flippedY * 11 + x) * 4

              const r = pixelGrid[flippedIndex]
              const g = pixelGrid[flippedIndex + 1]
              const b = pixelGrid[flippedIndex + 2]

              const isCenter = x === 5 && y === 5

              return (
                <div
                  key={i}
                  style={{
                    width: '16px',
                    height: '16px',
                    backgroundColor: `rgb(${r},${g},${b})`,
                    border: isCenter ? '2px solid #ef4444' : '1px solid #fff',
                    boxSizing: 'border-box',
                    cursor: 'pointer'
                  }}
                  title={`RGB(${r},${g},${b})`}
                />
              )
            })}
          </div>
          <div
            style={{
              marginTop: '4px',
              fontSize: '10px',
              color: '#666',
              textAlign: 'center'
            }}
          >
            Red border = selected pixel
          </div>
        </div>
      )}
    </>
  )
}
