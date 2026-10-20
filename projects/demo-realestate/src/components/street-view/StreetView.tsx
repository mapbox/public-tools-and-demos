import { useEffect, useRef } from 'react'
import { Viewer } from '@photo-sphere-viewer/core'
import {
  VirtualTourPlugin,
  type VirtualTourNode
} from '@photo-sphere-viewer/virtual-tour-plugin'
import '@photo-sphere-viewer/core/index.css'
import '@photo-sphere-viewer/virtual-tour-plugin/index.css'

import {
  ATTRIBUTION,
  bearing,
  neighbours,
  panoramaUrl,
  photoById,
  type StreetPhoto
} from '../../lib/kartaview'

const toRadians = Math.PI / 180

const captureDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  })

const toNode = async (photo: StreetPhoto): Promise<VirtualTourNode> => {
  const links = await neighbours(photo).catch(() => [])
  return {
    id: photo.id,
    panorama: panoramaUrl(photo),
    gps: photo.coordinates,
    // The panorama's centre is the direction the car faced. Turning it by the
    // heading puts north at yaw 0, so yaw reads as a compass bearing — which
    // is what GPS-positioned links and the map's view cone both assume.
    sphereCorrection: { pan: -photo.heading * toRadians },
    links: links.map((link) => ({ nodeId: link.id, gps: link.coordinates })),
    caption:
      `<a href="${ATTRIBUTION.href}" target="_blank" rel="noreferrer">${ATTRIBUTION.label}</a>` +
      ` · Captured ${captureDate(photo.date)}`,
    data: photo
  }
}

/**
 * A KartaView 360° panorama in Photo Sphere Viewer, opened facing the house.
 * The virtual tour plugin draws arrows on the road to the neighbouring photos
 * in the same capture sequence, fetching each step from KartaView as it goes.
 *
 * Loaded lazily: Photo Sphere Viewer brings three.js, which nobody should
 * download unless they open street view.
 */
export default function StreetView({
  photo,
  target,
  onPhotoChange,
  onBearing
}: {
  /** The photo to open on. */
  photo: StreetPhoto
  /** What to face on opening: the house. */
  target: [number, number]
  onPhotoChange: (photo: StreetPhoto) => void
  /** The compass bearing being looked at, in degrees, on every frame it moves. */
  onBearing: (degrees: number) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  // Callbacks change identity every render; the viewer is built once.
  const callbacks = useRef({ onPhotoChange, onBearing })
  callbacks.current = { onPhotoChange, onBearing }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const viewer = new Viewer({
      container,
      defaultYaw: bearing(photo.coordinates, target) * toRadians,
      defaultPitch: -0.05,
      navbar: ['zoom', 'caption', 'fullscreen'],
      // The viewer sits in a scrolling page: a plain wheel scrolls the page,
      // ctrl/⌘ + wheel zooms the panorama.
      mousewheelCtrlKey: true,
      plugins: [
        VirtualTourPlugin.withConfig({
          dataMode: 'server',
          positionMode: 'gps',
          renderMode: '3d',
          getNode: (id) => {
            const known = photoById(id)
            if (!known) throw new Error(`Unknown KartaView photo ${id}`)
            return toNode(known)
          },
          showLinkTooltip: false,
          preload: true
        })
      ]
    })

    viewer.addEventListener('position-updated', ({ position }) => {
      callbacks.current.onBearing(position.yaw / toRadians)
    })
    const tour = viewer.getPlugin<VirtualTourPlugin>(VirtualTourPlugin)
    tour.addEventListener('node-changed', ({ node }) => {
      callbacks.current.onPhotoChange(node.data as StreetPhoto)
    })
    // Started here rather than with the plugin's startNodeId, which starts it
    // without handling failure: closing before the first photo loads would
    // otherwise surface as an uncaught error from the destroyed plugin.
    tour.setCurrentNode(photo.id).catch(() => {})
    callbacks.current.onBearing(bearing(photo.coordinates, target))

    return () => viewer.destroy()
    // Opened once per photo the parent chooses; steps happen inside the tour.
  }, [photo, target])

  return <div ref={containerRef} className='size-full' />
}
