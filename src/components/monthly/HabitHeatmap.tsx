'use client'
import { isRoutineActiveOnDate } from '@/lib/utils'
import type { Routine, RoutineLog } from '@/lib/types'

interface Props {
  dates: string[]
  routines: Routine[]
  logs: RoutineLog[]
}

const CELL = 18
const GAP = 3

export default function HabitHeatmap({ dates, routines, logs }: Props) {
  if (!routines.length) return null

  function logFor(routineId: string, date: string) {
    return logs.find(l => l.routine_id === routineId && l.date === date)
  }

  function consistency(routine: Routine) {
    const activeDates = dates.filter(d => isRoutineActiveOnDate(routine.days, d))
    if (!activeDates.length) return 0
    const done = activeDates.filter(d => logFor(routine.id, d)?.completed).length
    return Math.round((done / activeDates.length) * 100)
  }

  return (
    <div className="card">
      <div className="card-title">✦ Habit Consistency</div>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'inline-block', minWidth: 'max-content' }}>
          {/* Day number header */}
          <div style={{ display: 'flex', gap: GAP, marginBottom: 6, marginLeft: 160 }}>
            {dates.map(d => (
              <div key={d} style={{ width: CELL, textAlign: 'center', fontSize: 8, color: 'var(--text-dim)', flexShrink: 0 }}>
                {parseInt(d.split('-')[2])}
              </div>
            ))}
            <div style={{ width: 40, flexShrink: 0 }} />
          </div>

          {/* Routine rows */}
          {routines.map(routine => {
            const pct = consistency(routine)
            return (
              <div key={routine.id} style={{ display: 'flex', alignItems: 'center', gap: GAP, marginBottom: GAP }}>
                <div style={{
                  width: 150, fontSize: 11, color: 'var(--text-mid)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  flexShrink: 0, paddingRight: 10, textAlign: 'right',
                }}>
                  {routine.name}
                </div>

                {dates.map(d => {
                  const active = isRoutineActiveOnDate(routine.days, d)
                  const done = active && logFor(routine.id, d)?.completed

                  if (!active) {
                    return (
                      <div key={d} style={{ width: CELL, height: CELL, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 4, height: 1, background: 'var(--border-light)' }} />
                      </div>
                    )
                  }
                  return (
                    <div
                      key={d}
                      title={d}
                      style={{
                        width: CELL, height: CELL,
                        borderRadius: 3,
                        flexShrink: 0,
                        background: done ? 'var(--green)' : 'transparent',
                        border: `1px solid ${done ? 'var(--green)' : 'var(--border)'}`,
                        opacity: done ? 0.85 : 0.45,
                        transition: 'all 0.1s',
                      }}
                    />
                  )
                })}

                <div style={{
                  marginLeft: 8, fontSize: 10, flexShrink: 0,
                  color: pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--amber)' : 'var(--text-dim)',
                }}>
                  {pct}%
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 10, color: 'var(--text-dim)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--green)', opacity: 0.85 }} /> done
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, border: '1px solid var(--border)', opacity: 0.45 }} /> missed
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ display: 'inline-block', width: 10, height: 1, background: 'var(--border-light)' }} /> not scheduled
        </span>
      </div>
    </div>
  )
}
