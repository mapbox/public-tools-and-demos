declare module 'mapbox-demo-components' {
  import { ReactNode } from 'react'

  export interface HeaderProps {
    title?: string
    githubLink?: string
  }

  export interface MapboxTooltipsProps {
    products: string[]
    projectFolder?: string
    bgColor?: string
  }

  // Only export the components you actually use
  export const Header: React.FC<HeaderProps>
  export const MapboxTooltips: React.FC<MapboxTooltipsProps>

  // For any other components you might import later, just use a simple type
  export const Map: React.FC<Record<string, unknown>>
  export const PageShell: React.FC<{ children: ReactNode }>
  export const FullscreenMapLayout: React.FC<Record<string, unknown>>
  export const FullscreenLayout: React.FC<Record<string, unknown>>
  export const ExternalLink: React.FC<Record<string, unknown>>
  export const FloatingSidebar: React.FC<Record<string, unknown>>
  export const LogoSVG: React.FC<Record<string, unknown>>
  export const accessToken: string
}
