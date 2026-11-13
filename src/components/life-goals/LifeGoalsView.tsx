'use client'

import { useRef } from 'react'
import type { MouseEvent } from 'react'
import Link from 'next/link'
import { usePlanetJourney } from './PlanetJourney'
import PlanetVisual from './PlanetVisual'
import styles from './LifeGoalsView.module.css'

export default function LifeGoalsView() {
  const planetRef = useRef<HTMLSpanElement>(null)
  const enterStudy = usePlanetJourney()

  function handleStudyClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented || event.button !== 0 || event.metaKey ||
      event.ctrlKey || event.shiftKey || event.altKey ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !planetRef.current
    ) return

    event.preventDefault()
    enterStudy(planetRef.current.getBoundingClientRect())
  }

  return (
    <section className={styles.page} aria-labelledby="life-goals-title">
      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowStar} aria-hidden="true" />
            AETHER · PERSONAL ATLAS
          </div>
          <h1 className={styles.title} id="life-goals-title">Life Goals</h1>
          <p className={styles.intro}>
            A quiet corner of the cosmos for the things you want to grow toward.
          </p>
        </div>
        <div className={styles.mapCount} role="status" aria-label="One category mapped">
          <span className={styles.mapCountNumber}>01</span>
          <span className={styles.mapCountLabel}>SECTOR MAPPED</span>
        </div>
      </header>

      <div className={styles.galaxy} role="group" aria-label="Life goals galaxy map">
        <div className={`${styles.orbit} ${styles.orbitOuter}`} aria-hidden="true" />
        <div className={`${styles.orbit} ${styles.orbitInner}`} aria-hidden="true" />
        <div className={styles.connector} aria-hidden="true" />
        <span className={`${styles.star} ${styles.starOne}`} aria-hidden="true" />
        <span className={`${styles.star} ${styles.starTwo}`} aria-hidden="true" />
        <span className={`${styles.star} ${styles.starThree}`} aria-hidden="true" />
        <span className={`${styles.star} ${styles.starFour}`} aria-hidden="true" />
        <span className={`${styles.star} ${styles.starFive}`} aria-hidden="true" />

        <Link
          href="/life-goals/study"
          className={styles.planet}
          aria-label="Enter the Study planet"
          onClick={handleStudyClick}
        >
          <PlanetVisual bodyRef={planetRef} />
        </Link>

        <article className={styles.holder} aria-labelledby="study-title">
          <div className={styles.holderTopline}>
            <span className={styles.sectorLabel}>
              <span className={styles.sectorDot} aria-hidden="true" />
              CATEGORY 01
            </span>
            <span className={styles.holderSymbol} aria-hidden="true">✦</span>
          </div>
          <h2 className={styles.holderTitle} id="study-title">Study</h2>
          <p className={styles.holderDescription} id="study-description">
            A world for curiosity, learning, and everything you hope to discover.
          </p>
          <div className={styles.holderFooter}>
            <span className={styles.footerOrbit} aria-hidden="true" />
            ENTER THE STUDY SECTOR
            <span className={styles.entryArrow} aria-hidden="true">↗</span>
          </div>
          <Link
            href="/life-goals/study"
            className={styles.holderLink}
            aria-labelledby="study-title"
            aria-describedby="study-description"
            onClick={handleStudyClick}
          />
        </article>

        <div className={styles.mapCaption} aria-hidden="true">
          <span className={styles.captionLine} />
          A NEW PART OF YOUR UNIVERSE
        </div>
      </div>

      <footer className={styles.footer}>
        <span className={styles.footerStatus}>
          <span className={styles.statusDot} aria-hidden="true" />
          YOUR ATLAS IS BEGINNING
        </span>
        <span className={styles.footerNote}>ONE WORLD, WITH ROOM TO EXPAND</span>
      </footer>
    </section>
  )
}
