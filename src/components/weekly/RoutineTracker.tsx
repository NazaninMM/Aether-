'use client'
import { Fragment } from 'react'
import { Routine, RoutineLog } from '@/lib/types'
import { isRoutineActiveOnDate, formatDate } from '@/lib/utils'

interface Props {
  routines: Routine[]
  logs: RoutineLog[]
  dates: string[]
  onToggle: (routineId: string, date: string, completed: boolean) => void
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function RoutineTracker({ routines, logs, dates, onToggle }: Props) {
  function logFor(routineId: string, date: string) {
    return logs.find(l => l.routine_id === routineId && l.date === date)
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="card">
      <div className="card-title">✦ Routine Tracker</div>

      {/* legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 14, fontSize: 10, color: 'var(--text-dim)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: 'var(--gold)' }} /> done
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', border: '1px solid var(--border)' }} /> not done
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ display: 'inline-block', width: 12, height: 1, background: 'var(--border-light)' }} /> not scheduled
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '150px repeat(7, 1fr)', gap: 6, alignItems: 'center', minWidth: 500 }}>
          {/* header */}
          <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-dim)', paddingBottom: 6 }}>Routine</div>
          {dates.map(d => {
            const dow = new Date(d + 'T12:00:00').getDay()
            const isToday = d === today
            return (
              <div key={d} style={{ fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: isToday ? 'var(--gold)' : 'var(--text-dim)', textAlign: 'center', paddingBottom: 6 }}>
                {DAY_NAMES[dow]}
              </div>
            )
          })}

          {/* rows */}
          {routines.map(routine => (
            <Fragment key={routine.id}>
              <div key={`name-${routine.id}`} style={{ fontSize: 12, color: 'var(--text-mid)', paddingRight: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                {routine.name}
                {routine.days && (
                  <span style={{ fontSize: 9, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '1px 5px', color: 'var(--text-dim)', flexShrink: 0 }}>
                    {routine.days.map(d => DAY_NAMES[d]).join('/')}
                  </span>
                )}
              </div>
              {dates.map(d => {
                const active = isRoutineActiveOnDate(routine.days, d)
                const log = logFor(routine.id, d)
                const done = log?.completed ?? false
                if (!active) {
                  return (
                    <div key={`${routine.id}-${d}`} style={{ width: 24, height: 24, margin: '0 auto', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: '50%', left: '50%', width: 14, height: 1, background: 'var(--border-light)', transform: 'translate(-50%,-50%) rotate(45deg)' }} />
                    </div>
                  )
                }
                return (
                  <button
                    key={`${routine.id}-${d}`}
                    onClick={() => onToggle(routine.id, d, !done)}
                    style={{
                      width: 24, height: 24, borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `1px solid ${done ? 'var(--gold)' : 'var(--border)'}`,
                      background: done ? 'var(--gold)' : 'none',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {done && <span style={{ width: 5, height: 8, borderRight: '1.5px solid #fff', borderBottom: '1.5px solid #fff', transform: 'rotate(45deg) translateY(-1px)', display: 'block' }} />}
                  </button>
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
