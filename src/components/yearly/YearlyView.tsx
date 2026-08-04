'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMonthDates, calendarPadding, getWeekStart, getWeekNumber, todayStr } from '@/lib/utils'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface CalRow {
  weekStart: string
  weekNum: number
  days: (string | null)[]
}

function buildRows(monthStart: string): CalRow[] {
  const pad = calendarPadding(monthStart)
  const dates = getMonthDates(monthStart)
  const trailing = (7 - ((pad + dates.length) % 7)) % 7
  const cells: (string | null)[] = [...Array(pad).fill(null), ...dates, ...Array(trailing).fill(null)]

  const rows: CalRow[] = []
  for (let i = 0; i < cells.length; i += 7) {
    const row = cells.slice(i, i + 7)
    const firstDate = row.find(d => d !== null) as string
    rows.push({
      weekStart: getWeekStart(firstDate),
      weekNum: getWeekNumber(firstDate),
      days: row,
    })
  }
  return rows
}

function MiniCalendar({ monthStart, today }: { monthStart: string; today: string }) {
  const router = useRouter()
  const monthIndex = parseInt(monthStart.split('-')[1]) - 1
  const rows = buildRows(monthStart)

  return (
    <div className="card" style={{ padding: 14 }}>
      {/* Month name → monthly view */}
      <div
        onClick={() => router.push(`/monthly?month=${monthStart}`)}
        style={{
          fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase',
          color: 'var(--gold)', cursor: 'pointer', marginBottom: 10,
          textAlign: 'center', transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        {MONTH_NAMES[monthIndex]}
      </div>

      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '20px repeat(7, 1fr)', gap: 2, marginBottom: 3 }}>
        <div />
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} style={{ fontSize: 8, textAlign: 'center', color: 'var(--text-dim)' }}>{d}</div>
        ))}
      </div>

      {/* Week rows */}
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: 'grid', gridTemplateColumns: '20px repeat(7, 1fr)', gap: 2, marginBottom: 2 }}>
          {/* Week number → weekly view */}
          <div
            onClick={() => router.push(`/weekly?week=${row.weekStart}`)}
            title={`Week ${row.weekNum}`}
            style={{
              fontSize: 7, color: 'var(--gold-dim)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 2, transition: 'color 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--gold-dim)')}
          >
            {row.weekNum}
          </div>

          {/* Day cells → daily view */}
          {row.days.map((date, di) => {
            if (!date) return <div key={di} />
            const isToday = date === today
            const isFuture = date > today
            return (
              <div
                key={di}
                onClick={() => router.push(`/daily?date=${date}`)}
                style={{
                  fontSize: 9, textAlign: 'center', cursor: 'pointer',
                  borderRadius: 3, padding: '2px 0',
                  color: isToday ? 'var(--gold)' : 'var(--text)',
                  background: isToday ? 'var(--gold-glow)' : 'transparent',
                  border: `1px solid ${isToday ? 'var(--gold-dim)' : 'transparent'}`,
                  opacity: isFuture ? 0.35 : 1,
                  fontWeight: isToday ? 600 : 400,
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (!isToday) e.currentTarget.style.background = 'var(--surface-2)' }}
                onMouseLeave={e => { if (!isToday) e.currentTarget.style.background = 'transparent' }}
              >
                {parseInt(date.split('-')[2])}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default function YearlyView() {
  const today = todayStr()
  const currentYear = parseInt(today.split('-')[0])
  const [year, setYear] = useState(currentYear)

  const monthStarts = Array.from({ length: 12 }, (_, i) => {
    return `${year}-${String(i + 1).padStart(2, '0')}-01`
  })

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: 28 }}>

      {/* Header */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <button
          onClick={() => setYear(y => y - 1)}
          style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-dim)', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
        >‹</button>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 52, color: 'var(--border)', lineHeight: 1, userSelect: 'none' }}>
          {year}
        </div>
        <button
          onClick={() => setYear(y => y + 1)}
          style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-dim)', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
        >›</button>
        <div style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-dim)', letterSpacing: 0.5 }}>
          Month name → monthly · Week number → weekly · Day → daily
        </div>
      </div>

      {/* 4×3 month grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {monthStarts.map(ms => (
          <MiniCalendar key={ms} monthStart={ms} today={today} />
        ))}
      </div>
    </div>
  )
}
