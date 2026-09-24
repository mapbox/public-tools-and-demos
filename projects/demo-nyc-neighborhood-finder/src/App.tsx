import { useState, useMemo, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import Chat from './components/Chat'
import MapView from './components/MapView'
import NeighborhoodProfile from './components/NeighborhoodProfile'
import Toast from './components/Toast'
import { useNeighborhoodData } from './hooks/useNeighborhoodData'
import { NEIGHBORHOOD_COLORS } from './types'
import type { RecommendedNeighborhood } from './types'
import './App.css'

function App() {
  const [hoveredNeighborhood, setHoveredNeighborhood] = useState<string | null>(
    null
  )
  const [profileNeighborhood, setProfileNeighborhood] =
    useState<RecommendedNeighborhood | null>(null)
  const [errorDismissed, setErrorDismissed] = useState(false)
  const [input, setInput] = useState('')

  const {
    index: neighborhoodIndex,
    features: neighborhoodFeatures,
    getBounds
  } = useNeighborhoodData()
  const { messages, sendMessage, status, error, clearError } = useChat({
    api: '/api/chat'
  })
  const isLoading = status === 'submitted' || status === 'streaming'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput('')
  }

  useEffect(() => {
    if (error) setErrorDismissed(false)
  }, [error])

  // Surface show_neighborhoods calls that failed or landed in an unexpected state,
  // which otherwise get silently skipped by the enrichment logic below.
  useEffect(() => {
    for (const msg of messages) {
      if (msg.role !== 'assistant') continue
      for (const part of msg.parts) {
        if (part.type !== 'tool-show_neighborhoods') continue
        if (part.state === 'output-error') {
          console.warn(
            '[show_neighborhoods] tool call errored, will not render on map:',
            part
          )
        } else if (
          part.state !== 'input-available' &&
          part.state !== 'output-available' &&
          part.state !== 'input-streaming'
        ) {
          console.warn(
            '[show_neighborhoods] unexpected part state:',
            part.state,
            part
          )
        }
      }
    }
  }, [messages])

  // Enrich neighborhoods from show_neighborhoods tool invocations, keyed by message id for card display
  const { neighborhoodsByMessageId, recommendedNeighborhoods } = useMemo(() => {
    const byId = new Map<string, RecommendedNeighborhood[]>()
    const allSeen = new Map<string, RecommendedNeighborhood>()
    let colorIdx = 0

    for (const msg of messages) {
      if (msg.role !== 'assistant') continue
      const invPart = msg.parts.find(
        (p) =>
          p.type === 'tool-show_neighborhoods' &&
          (p.state === 'input-available' || p.state === 'output-available')
      )
      if (!invPart || invPart.type !== 'tool-show_neighborhoods') continue
      const raw = invPart.input
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
      const rawNeighborhoods = (parsed as { neighborhoods: unknown })
        .neighborhoods
      const neighborhoods =
        typeof rawNeighborhoods === 'string'
          ? (JSON.parse(rawNeighborhoods) as {
              name: string
              borough: string
              reason?: string
              vibe?: string
            }[])
          : (rawNeighborhoods as {
              name: string
              borough: string
              reason?: string
              vibe?: string
            }[])
      if (!Array.isArray(neighborhoods)) continue

      const enriched = neighborhoods.map((n) => {
        if (allSeen.has(n.name)) return allSeen.get(n.name)!
        const props = neighborhoodIndex.get(n.name.toLowerCase())
        const color =
          NEIGHBORHOOD_COLORS[colorIdx++ % NEIGHBORHOOD_COLORS.length]
        const enrichedN: RecommendedNeighborhood = {
          ...n,
          color,
          reason:
            n.reason ??
            n.vibe ??
            ((n as Record<string, unknown>).description as string) ??
            '',
          summary: props?.summary,
          wikipedia_url: props?.wikipedia_url,
          slug: props?.slug
        }
        allSeen.set(n.name, enrichedN)
        return enrichedN
      })

      byId.set(msg.id, enriched)
    }

    return {
      neighborhoodsByMessageId: byId,
      recommendedNeighborhoods: Array.from(allSeen.values())
    }
  }, [messages, neighborhoodIndex])

  // Only fit bounds to the most-recently-recommended set
  const boundsToFit = useMemo(() => {
    const last = [...messages]
      .reverse()
      .find(
        (msg) =>
          msg.role === 'assistant' &&
          msg.parts.some((p) => p.type === 'tool-show_neighborhoods')
      )
    if (!last) return null
    const invPart = last.parts.find(
      (p) =>
        p.type === 'tool-show_neighborhoods' &&
        (p.state === 'input-available' || p.state === 'output-available')
    )
    if (
      !invPart ||
      invPart.type !== 'tool-show_neighborhoods' ||
      !invPart.input
    )
      return null
    const raw = invPart.input
    const parsed =
      typeof raw === 'string'
        ? JSON.parse(raw)
        : (raw as { neighborhoods: unknown })
    const rawNeighborhoods = (parsed as { neighborhoods: unknown })
      .neighborhoods
    const neighborhoods =
      typeof rawNeighborhoods === 'string'
        ? (JSON.parse(rawNeighborhoods) as { name: string }[])
        : (rawNeighborhoods as { name: string }[])
    if (!Array.isArray(neighborhoods)) return null
    return getBounds(neighborhoods.map((n) => n.name))
  }, [messages, getBounds])

  const handleMapNeighborhoodClick = (name: string) => {
    const found = recommendedNeighborhoods.find((n) => n.name === name)
    if (found) setProfileNeighborhood(found)
  }

  return (
    <div className='app-layout'>
      <Chat
        messages={messages}
        neighborhoodsByMessageId={neighborhoodsByMessageId}
        input={input}
        isLoading={isLoading}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        onNeighborhoodHoverEnter={setHoveredNeighborhood}
        onNeighborhoodHoverLeave={() => setHoveredNeighborhood(null)}
        onNeighborhoodClick={setProfileNeighborhood}
      />
      <MapView
        recommendedNeighborhoods={recommendedNeighborhoods}
        hoveredNeighborhood={hoveredNeighborhood}
        boundsToFit={boundsToFit}
        geojsonFeatures={neighborhoodFeatures}
        onNeighborhoodClick={handleMapNeighborhoodClick}
      />
      {profileNeighborhood && (
        <NeighborhoodProfile
          neighborhood={profileNeighborhood}
          onClose={() => setProfileNeighborhood(null)}
        />
      )}
      {!errorDismissed && error && (
        <Toast
          message={error.message}
          onDismiss={() => {
            setErrorDismissed(true)
            clearError()
          }}
        />
      )}
    </div>
  )
}

export default App
