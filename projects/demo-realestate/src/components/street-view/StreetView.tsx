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

/**
 * Phones and small screens: half the panorama width and no preloading. A
 * 4096px panorama is ~32MB decoded on the GPU, and iOS Safari reloads the tab
 * once a few of those sit beside the map's WebGL context.
 */
const constrained = window.matchMedia(
  '(max-width: 767px), (pointer: coarse)'
).matches
const PANORAMA_WIDTH = constrained ? 2048 : 4096

/** Photos whose panorama failed to load: never offered as a step again. */
const unreachable = new Set<string>()

const toNode = async (photo: StreetPhoto): Promise<VirtualTourNode> => {
  const links = (await neighbours(photo).catch(() => [])).filter(
    (link) => !unreachable.has(link.id)
  )
  return {
    id: photo.id,
    panorama: panoramaUrl(photo, PANORAMA_WIDTH),
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
      // It already fills the screen, so no fullscreen button; the wheel
      // zooms and the arrow keys look around. When the caption is too long
      // for a phone's navbar the viewer hides it, and the description button
      // is what shows it then: without it the KartaView credit is lost.
      navbar: ['zoom', 'description', 'caption'],
      keyboard: 'always',
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
          preload: !constrained
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
    // An arrow only leads to a photo KartaView listed, but its panorama can
    // still fail to load (a CDN error, a rate limit). The plugin would then
    // leave its "Cannot load image" overlay with no arrows and an unhandled
    // rejection. Instead: drop that step and reload the photo we stood on,
    // which rebuilds its arrows without it.
    const setCurrentNode = tour.setCurrentNode.bind(tour)
    tour.setCurrentNode = (nodeId, options, fromLink) =>
      setCurrentNode(nodeId, options, fromLink).catch(() => {
        const current = tour.getCurrentNode()
        if (!current || nodeId === current.id) return false
        unreachable.add(nodeId)
        viewer.notification.show({
          content: 'Street view can’t go any further this way',
          timeout: 3000
        })
        return setCurrentNode(current.id, { forceUpdate: true }).catch(
          () => false
        )
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
