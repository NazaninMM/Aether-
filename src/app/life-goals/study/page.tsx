import type { Metadata } from 'next'
import StudyTasks from '@/components/study/StudyTasks'

export const metadata: Metadata = {
  title: 'Study | Aether',
}

export default function StudyPage() {
  return <StudyTasks />
}
