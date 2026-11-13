'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import PlanetVisual from './PlanetVisual'
import styles from './LifeGoalsView.module.css'

const STUDY_PATH = '/life-goals/study'
const JourneyContext = createContext<((origin: DOMRect) => void) | null>(null)

type Journey = {
  x: number
  y: number
  initialScale: number
  finalScale: number
}

export function usePlanetJourney() {
  const enter = useContext(JourneyContext)
  if (!enter) throw new Error('Planet journeys require PlanetJourneyProvider')
  return enter
}

export default function PlanetJourneyProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const entering = useRef(false)
  const [journey, setJourney] = useState<Journey | null>(null)
  const arrived = pathname === STUDY_PATH

  useEffect(() => {
    if (arrived && !journey) {
      document.getElementById('study-world')?.focus({ preventScroll: true })
    }
  }, [arrived, journey])

  function enterStudy(origin: DOMRect) {
    if (entering.current) return
    entering.current = true
    router.prefetch(STUDY_PATH)
    setJourney({
      x: origin.left + origin.width / 2,
      y: origin.top + origin.height / 2,
      initialScale: origin.width / 188,
      finalScale: Math.hypot(window.innerWidth, window.innerHeight) / 188 * 1.25,
    })
  }

  return (
    <JourneyContext.Provider value={enterStudy}>
      <div inert={journey ? true : undefined}>{children}</div>
      {journey && (
        <div
          className={`${styles.journey} ${arrived ? styles.journeyReveal : ''}`}
          style={{
            '--origin-x': `${journey.x}px`,
            '--origin-y': `${journey.y}px`,
            '--initial-scale': journey.initialScale,
            '--final-scale': journey.finalScale,
          } as CSSProperties}
          role="status"
          aria-label="Entering Study"
          tabIndex={-1}
          ref={node => { node?.focus({ preventScroll: true }) }}
          onAnimationEnd={event => {
            if (event.target !== event.currentTarget || !arrived) return
            entering.current = false
            setJourney(null)
          }}
        >
          <div className={styles.journeyBackdrop} aria-hidden="true" />
          <div className={styles.journeyStars} aria-hidden="true">
            {Array.from({ length: 18 }, (_, index) => (
              <span
                key={index}
                style={{
                  '--ray-angle': `${index * 20 + 7}deg`,
                  '--ray-distance': `${22 + (index % 5) * 7}vmin`,
                  '--ray-delay': `${(index % 4) * 35}ms`,
                } as CSSProperties}
              />
            ))}
          </div>
          <div className={styles.journeyPlanet} aria-hidden="true">
            <PlanetVisual />
          </div>
          <div className={styles.journeyAtmosphere} aria-hidden="true" />
          <div
            className={styles.journeyVeil}
            aria-hidden="true"
            onAnimationEnd={event => {
              if (event.target === event.currentTarget && !arrived) {
                router.push(STUDY_PATH)
              }
            }}
          />
        </div>
      )}
    </JourneyContext.Provider>
  )
}
