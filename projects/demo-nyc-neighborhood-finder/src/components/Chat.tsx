import { useEffect, useRef } from 'react'
import Markdown from 'react-markdown'
import type { UIMessage } from 'ai'
import type { RecommendedNeighborhood } from '../types'
import NeighborhoodCard from './NeighborhoodCard'
import './Chat.css'

function parseInput(input: unknown): Record<string, unknown> {
  if (typeof input === 'string') {
    try { return JSON.parse(input) } catch { return {} }
  }
  return (input ?? {}) as Record<string, unknown>
}

function fmtNum(v: unknown): string {
  const n = Number(v)
  return isNaN(n) ? '?' : n.toFixed(3)
}

function fmtCoord(v: unknown): string {
  if (typeof v === 'string') { try { v = JSON.parse(v) } catch { /* ignore */ } }
  if (Array.isArray(v) && v.length >= 2) return `(${fmtNum(v[0])}, ${fmtNum(v[1])})`
  if (typeof v === 'object' && v !== null) {
    const o = v as Record<string, unknown>
    if ('longitude' in o && 'latitude' in o) return `(${fmtNum(o.longitude)}, ${fmtNum(o.latitude)})`
  }
  return ''
}

function formatToolCall(name: string, rawInput: unknown): string {
  const i = parseInput(rawInput)
  switch (name) {
    case 'search_and_geocode_tool':
      return `Searching for "${i.q}"${i.proximity ? ` near ${fmtCoord(i.proximity)}` : ''}`
    case 'category_search_tool': {
      const cat = typeof i.category === 'string' ? i.category : i.poi_category ?? '...'
      return `Searching category "${cat}"${i.proximity ? ` near ${fmtCoord(i.proximity)}` : ''}${i.bbox ? ' in bounding box' : ''}`
    }
    case 'reverse_geocode_tool':
      return `Reverse geocoding (${fmtNum(i.longitude)}, ${fmtNum(i.latitude)})`
    case 'ground_location_tool':
      return `Grounding location (${fmtNum(i.longitude)}, ${fmtNum(i.latitude)})${i.query ? ` — "${i.query}"` : ''}`
    case 'directions_tool': {
      const coords = Array.isArray(i.coordinates) ? i.coordinates : []
      return `Getting directions (${coords.length} waypoints) via ${i.routing_profile ?? 'driving'}`
    }
    case 'isochrone_tool': {
      const mins = Array.isArray(i.contours_minutes) ? i.contours_minutes.join(', ') + ' min' : ''
      return `Isochrone ${fmtCoord(i.coordinates)}${mins ? ` — ${mins}` : ''} by ${i.profile ?? 'driving'}`
    }
    case 'matrix_tool': {
      const coords = Array.isArray(i.coordinates) ? i.coordinates : []
      return `Travel time matrix for ${coords.length} locations`
    }
    case 'place_details_tool':
      return `Fetching place details`
    case 'static_map_image_tool':
      return `Rendering static map`
    default:
      return `Calling Mapbox ${name.replace(/_tool$/, '').replaceAll('_', ' ')}`
  }
}

type ChatProps = {
  messages: UIMessage[]
  neighborhoodsByMessageId: Map<string, RecommendedNeighborhood[]>
  input: string
  isLoading: boolean
  onInputChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  onNeighborhoodHoverEnter: (name: string) => void
  onNeighborhoodHoverLeave: () => void
  onNeighborhoodClick: (n: RecommendedNeighborhood) => void
}

export default function Chat({
  messages,
  neighborhoodsByMessageId,
  input,
  isLoading,
  onInputChange,
  onSubmit,
  onNeighborhoodHoverEnter,
  onNeighborhoodHoverLeave,
  onNeighborhoodClick,
}: ChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [input])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!input.trim() || isLoading) return
      onSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h1>NYC Neighborhood Finder</h1>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <p>Describe the vibe or requirements you're looking for in a neighborhood and I'll help you find the right fit.</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const textPart = msg.parts.find(p => p.type === 'text')
          const toolParts = msg.parts.filter(p => p.type === 'dynamic-tool' && p.toolName !== 'show_neighborhoods')
          const isLastMessage = i === messages.length - 1

          return (
            <div key={msg.id} className={`chat-message chat-message--${msg.role}`}>
              {msg.role === 'user' ? (
                <div className="chat-bubble chat-bubble--user">
                  {textPart?.type === 'text' ? textPart.text : ''}
                </div>
              ) : (
                <div className="chat-bubble chat-bubble--assistant">
                  {/* Tool call status log */}
                  {toolParts.length > 0 && (
                    <div className="chat-status-log">
                      {toolParts.map(part => {
                        if (part.type !== 'dynamic-tool') return null
                        const isActive = part.state !== 'output-available' && isLoading && isLastMessage
                        return (
                          <div key={part.toolCallId} className={`chat-status-entry ${isActive ? 'chat-status-entry--active' : 'chat-status-entry--done'}`}>
                            {isActive ? <span className="chat-status-spinner" /> : <span className="chat-status-check">✓</span>}
                            <span>{formatToolCall(part.toolName, part.input)}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  {/* Thinking dots */}
                  {isLoading && isLastMessage && !textPart && toolParts.length === 0 && (
                    <div className="chat-thinking">
                      <span className="chat-thinking-dot" />
                      <span className="chat-thinking-dot" />
                      <span className="chat-thinking-dot" />
                    </div>
                  )}
                  {/* Message text */}
                  {textPart?.type === 'text' && textPart.text && (
                    <div className="chat-markdown">
                      <Markdown>{textPart.text}</Markdown>
                    </div>
                  )}
                  {/* Neighborhood cards */}
                  {neighborhoodsByMessageId.has(msg.id) && (
                    <div className="chat-cards">
                      {neighborhoodsByMessageId.get(msg.id)!.map(n => (
                        <NeighborhoodCard
                          key={n.name}
                          neighborhood={n}
                          onHoverEnter={onNeighborhoodHoverEnter}
                          onHoverLeave={onNeighborhoodHoverLeave}
                          onClick={onNeighborhoodClick}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={onSubmit}>
        <textarea
          ref={textareaRef}
          className="chat-input"
          value={input}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the vibe or requirements you're looking for in a neighborhood"
          disabled={isLoading}
          rows={1}
          autoFocus
        />
        <button className="chat-submit" type="submit" disabled={!input.trim() || isLoading}>
          Send
        </button>
      </form>
    </div>
  )
}
