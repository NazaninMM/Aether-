import type { ReactNode } from 'react'
import PlanetJourneyProvider from '@/components/life-goals/PlanetJourney'

export default function LifeGoalsLayout({ children }: { children: ReactNode }) {
  return <PlanetJourneyProvider>{children}</PlanetJourneyProvider>
}
