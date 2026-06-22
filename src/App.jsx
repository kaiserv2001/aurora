import './styles/tokens.css'

import { SmoothScroll } from './providers/SmoothScroll'
import { CursorContext } from './providers/CursorContext'
import { Cursor } from './components/Cursor'
import { Hero } from './components/sections/Hero'
import { Manifesto } from './components/sections/Manifesto'
import { Studies } from './components/sections/Studies'
import { Interactive } from './components/sections/Interactive'
import { Footer } from './components/sections/Footer'

// Provider tree: SmoothScroll > CursorContext > page
// motion-designer owns the RAF wiring inside SmoothScroll and CursorContext.
export default function App() {
  return (
    <SmoothScroll>
      <CursorContext>
        {/* Custom cursor overlay — owner: motion-designer */}
        <Cursor />

        <main>
          <Hero />
          <Manifesto />
          <Studies />
          <Interactive />
          <Footer />
        </main>
      </CursorContext>
    </SmoothScroll>
  )
}
