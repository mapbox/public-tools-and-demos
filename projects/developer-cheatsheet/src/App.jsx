import { FullscreenLayout } from 'mapbox-demo-components'

import '@mapbox/mbx-assembly/dist/assembly.js'
import '@mapbox/mbx-assembly/dist/assembly.css'

function App() {
  return (
    <div className='App h-viewport-full'>
      <FullscreenLayout
        headerProps={{
          title: 'Mapbox Developer Cheat Sheet',
          githubLink:
            'https://github.com/mapbox/public-tools-and-demos/tree/main/projects/developer-cheatsheet'
        }}
      >
        <iframe
          height='100%'
          width='100%'
          src={import.meta.env.BASE_URL + '/developer-cheatsheet.html'}
        />
      </FullscreenLayout>
    </div>
  )
}

export default App
