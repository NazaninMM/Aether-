'use client'
import { useState } from 'react'
import { addDays, formatDate, todayStr } from '@/lib/utils'
import GoalOfDay from './GoalOfDay'
import TimeBlocks from './TimeBlocks'
import Tasks from './Tasks'
import Events from './Events'
import Routines from './Routines'
import DailyNotes from './DailyNotes'

export default function DailyView() {
  const [date, setDate] = useState(todayStr)
  const fmt = formatDate(date)
  const isToday = date === todayStr()

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: 28 }}>

      {/* TOP ROW */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'stretch' }}>

        {/* Date block */}
        <div className="card" style={{ minWidth: 170, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <button onClick={() => setDate(d => addDays(d, -1))} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-dim)', width: 26, height: 26, borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>‹</button>
            <button onClick={() => setDate(todayStr())} style={{ flex: 1, background: 'none', border: 'none', color: isToday ? 'var(--gold)' : 'var(--text-dim)', fontSize: 10, letterSpacing: 1, cursor: 'pointer', textTransform: 'uppercase' }}>
              {isToday ? 'Today' : 'Go to today'}
            </button>
            <button onClick={() => setDate(d => addDays(d, 1))} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-dim)', width: 26, height: 26, borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>›</button>
          </div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 52, color: 'var(--text)', lineHeight: 1 }}>{fmt.day}</div>
          <div style={{ fontSize: 11, letterSpacing: '1.5px', color: 'var(--text-dim)', marginTop: 4, textTransform: 'uppercase' }}>{fmt.weekday} · {fmt.full.split(',')[1]?.trim()}</div>
        </div>

        {/* Goal of day */}
        <GoalOfDay date={date} />

      </div>

      {/* BODY */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16 }}>

        {/* Left sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Routines date={date} />
          <DailyNotes date={date} />
        </div>

        {/* Right main */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <TimeBlocks date={date} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Tasks date={date} />
            <Events date={date} />
          </div>
        </div>

      </div>
    </div>
  )
}
