import type { Ref } from 'react'
import styles from './LifeGoalsView.module.css'

export default function PlanetVisual({ bodyRef }: { bodyRef?: Ref<HTMLSpanElement> }) {
  return (
    <span className={styles.planetVisual} aria-hidden="true">
      <span className={styles.planetRing} />
      <span className={styles.planetBody} ref={bodyRef}>
        <span className={styles.planetCraterOne} />
        <span className={styles.planetCraterTwo} />
        <span className={styles.planetCraterThree} />
      </span>
      <span className={styles.moon} />
    </span>
  )
}
