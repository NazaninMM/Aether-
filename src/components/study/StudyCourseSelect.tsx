'use client'
import type { StudyCourse } from '@/lib/types'

export default function StudyCourseSelect({ value, courses, onChange, label = 'Course' }: {
  value: string
  courses: StudyCourse[]
  onChange: (courseId: string) => void
  label?: string
}) {
  const selected = courses.find(course => course.id === value)
  return (
    <select
      value={value}
      onChange={event => onChange(event.target.value)}
      aria-label={label}
      title={label}
      style={{
        maxWidth: 150, background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: 999, padding: '3px 8px', color: selected?.color ?? 'var(--text-dim)',
        fontSize: 10, outline: 'none', cursor: 'pointer',
      }}
    >
      <option value="">No course</option>
      {courses.map(course => <option key={course.id} value={course.id}>{course.name}</option>)}
    </select>
  )
}
