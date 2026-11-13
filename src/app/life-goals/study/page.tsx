import type { Metadata } from 'next'
import styles from '@/components/life-goals/LifeGoalsView.module.css'

export const metadata: Metadata = {
  title: 'Study | Aether',
}

export default function StudyPage() {
  return (
    <section
      id="study-world"
      className={styles.studyWorld}
      aria-label="Study"
      tabIndex={-1}
    />
  )
}
