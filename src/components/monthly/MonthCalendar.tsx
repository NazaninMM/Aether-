'use client'
import { useRouter } from 'next/navigation'
import { getMonthDates, calendarPadding, todayStr } from '@/lib/utils'
import type { DailyNote } from '@/lib/types'

const MOOD_COLORS = ['', 'var(--green)', 'var(--amber)', 'var(--event-color)'] as const

interface CalTask { id: string; date: string; title: string; completed: boolean }

interface Props {
  monthStart: string
  tasksByDate: Record<string, CalTask[]>
  notesByDate: Record<string, DailyNote>
}

export default function MonthCalendar({ monthStart, tasksByDate, notesByDate }: Props) {
  const router = useRouter()
  const today = todayStr()
  const dates = getMonthDates(monthStart)
  const pad = calendarPadding(monthStart)
  const trailing = (7 - ((pad + dates.length) % 7)) % 7

  return (
    <div className="card">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} style={{
            textAlign: 'center', fontSize: 9, letterSpacing: '1.5px',
            textTransform: 'uppercase', color: 'var(--text-dim)',
            paddingBottom: 10, borderBottom: '1px solid var(--border)',
          }}>{d}</div>
        ))}

        {Array.from({ length: pad }).map((_, i) => <div key={`pre-${i}`} />)}

        {dates.map(date => {
          const tasks = tasksByDate[date] ?? []
          const note = notesByDate[date]
          const isToday = date === today
          const isFuture = date > today
          const done = tasks.filter(t => t.completed).length
          const total = tasks.length
          const moodColor = note?.mood ? MOOD_COLORS[note.mood] : null

          return (
            <div
              key={date}
              onClick={() => router.push(`/daily?date=${date}`)}
              style={{
                borderRadius: 8,
                padding: '8px 8px 6px',
                minHeight: 72,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                background: isToday ? 'var(--gold-glow)' : 'var(--surface-2)',
                border: `1px solid ${isToday ? 'var(--gold-dim)' : 'var(--border)'}`,
                borderBottom: moodColor
                  ? `3px solid ${moodColor}`
                  : `1px solid ${isToday ? 'var(--gold-dim)' : 'var(--border)'}`,
                opacity: isFuture ? 0.45 : 1,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => {
                if (!isFuture) e.currentTarget.style.background = isToday ? 'var(--gold-glow)' : 'var(--surface)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = isToday ? 'var(--gold-glow)' : 'var(--surface-2)'
              }}
            >
              <div style={{
                fontFamily: 'Georgia, serif',
                fontSize: 18,
                color: isToday ? 'var(--gold)' : 'var(--text)',
                lineHeight: 1,
              }}>
                {parseInt(date.split('-')[2])}
              </div>
              {total > 0 && (
                <div style={{
                  fontSize: 9,
                  color: done === total ? 'var(--green)' : 'var(--amber)',
                  marginTop: 'auto',
                }}>
                  {done}/{total}
                </div>
              )}
            </div>
          )
        })}

        {Array.from({ length: trailing }).map((_, i) => <div key={`post-${i}`} />)}
      </div>
    </div>
  )
}
