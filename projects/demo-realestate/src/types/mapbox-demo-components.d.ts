// `mapbox-demo-components` ships untyped JSX. Deep module paths are declared
// individually because importing the package barrel also evaluates its `Map`
// component, which pulls in a second copy of mapbox-gl.
declare module 'mapbox-demo-components/src/page-shell' {
  import type { ReactNode } from 'react'
  export default function PageShell(props: {
    children?: ReactNode
  }): JSX.Element
}

declare module 'mapbox-demo-components/src/logo-svg' {
  export default function LogoSVG(props: { fillColor?: string }): JSX.Element
}
