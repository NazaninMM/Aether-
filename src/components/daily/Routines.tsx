'use client'
import { useState, useEffect } from 'react'
import { getRoutines, getRoutineLogs, toggleRoutineLog, addRoutine, deleteRoutine } from '@/lib/db'
import { isRoutineActiveOnDate, computeStreak, addDays } from '@/lib/utils'
import type { Routine, RoutineLog } from '@/lib/types'
import FlameIcon from '../FlameIcon'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function buildStreakDates(date: string, n = 30): string[] {
  return Array.from({ length: n }, (_, i) => addDays(date, -i))
}

export default function Routines({ date }: { date: string }) {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [logs, setLogs] = useState<RoutineLog[]>([])
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [allDays, setAllDays] = useState(true)

  const streakDates = buildStreakDates(date)

  useEffect(() => {
    getRoutines().then(setRoutines)
    getRoutineLogs(streakDates).then(setLogs)
  }, [date])

  function logFor(routineId: string, d: string) {
    return logs.find(l => l.routine_id === routineId && l.date === d)
  }

  async function handleToggle(routine: Routine) {
    const current = logFor(routine.id, date)
    const completed = !(current?.completed ?? false)
    await toggleRoutineLog(routine.id, date, completed)
    setLogs(ls => {
      const existing = ls.find(l => l.routine_id === routine.id && l.date === date)
      if (existing) return ls.map(l => l.routine_id === routine.id && l.date === date ? { ...l, completed } : l)
      return [...ls, { id: '', routine_id: routine.id, date, completed }]
    })
  }

  async function handleAdd() {
    const n = name.trim()
    if (!n) { setAdding(false); return }
    await addRoutine(n, allDays ? null : selectedDays)
    getRoutines().then(setRoutines)
    setName(''); setSelectedDays([]); setAllDays(true); setAdding(false)
  }

  async function handleDelete(id: string) {
    await deleteRoutine(id)
    setRoutines(rs => rs.filter(r => r.id !== id))
  }

  const activeRoutines = routines.filter(r => isRoutineActiveOnDate(r.days, date))

  return (
    <div className="card">
      <div className="card-title">✦ Daily Routines</div>

      {activeRoutines.map(routine => {
        const log = logFor(routine.id, date)
        const done = log?.completed ?? false
        const streak = computeStreak(
          streakDates.map(d => ({ date: d, completed: logFor(routine.id, d)?.completed ?? false }))
        )
        return (
          <div key={routine.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
            <button
              onClick={() => handleToggle(routine)}
              style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                border: `2px solid ${done ? 'var(--green)' : 'var(--border-light)'}`,
                background: done ? 'var(--green)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 0, transition: 'all 0.15s',
              }}
            >
              {done && <span style={{ color: 'white', fontSize: 9, lineHeight: 1 }}>✓</span>}
            </button>
            <span style={{ flex: 1, fontSize: 13, color: done ? 'var(--text-dim)' : 'var(--text)', textDecoration: done ? 'line-through' : 'none' }}>
              {routine.name}
            </span>
            {routine.days && (
              <span style={{ fontSize: 9, color: 'var(--text-dim)', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '1px 6px' }}>
                {routine.days.map(d => DAY_NAMES[d]).join('/')}
              </span>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: streak > 0 ? 'var(--amber)' : 'var(--text-dim)' }}>
              {streak > 0 ? <FlameIcon /> : '—'} {streak > 0 ? streak : 0}
            </div>
            <button onClick={() => handleDelete(routine.id)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 14, padding: '0 2px', opacity: 0, transition: 'opacity 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>×</button>
          </div>
        )
      })}

      {adding ? (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Routine name…"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-dim)', cursor: 'pointer' }}>
              <input type="checkbox" checked={allDays} onChange={e => setAllDays(e.target.checked)} />
              Every day
            </label>
            {!allDays && (
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {DAY_NAMES.map((d, i) => (
                  <button key={i} onClick={() => setSelectedDays(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                    style={{ padding: '3px 8px', borderRadius: 12, fontSize: 11, cursor: 'pointer', border: '1px solid var(--border)', background: selectedDays.includes(i) ? 'var(--gold)' : 'var(--surface-2)', color: selectedDays.includes(i) ? '#fff' : 'var(--text-dim)' }}>
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleAdd} style={{ flex: 1, background: 'var(--gold)', border: 'none', borderRadius: 6, color: '#fff', padding: '6px', fontSize: 12, cursor: 'pointer' }}>Add</button>
            <button onClick={() => setAdding(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-dim)', padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="add-btn" onClick={() => setAdding(true)}>+ add routine</button>
      )}
    </div>
  )
}
