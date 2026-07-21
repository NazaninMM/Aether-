'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  getMonthlyGoal, upsertMonthlyGoal,
  getTasksInRange, getDailyNotesInRange,
  getRoutines, getRoutineLogs,
} from '@/lib/db'
import {
  getMonthStart, addMonths, getMonthDates, formatMonthName,
  todayStr, isRoutineActiveOnDate,
} from '@/lib/utils'
import type { MonthlyGoal, DailyNote, Routine, RoutineLog } from '@/lib/types'
import MonthCalendar from './MonthCalendar'
import MonthlyTasks from './MonthlyTasks'
import HabitHeatmap from './HabitHeatmap'

type CalTask = { id: string; date: string; title: string; completed: boolean }

export default function MonthlyView() {
  const today = todayStr()
  const [monthStart, setMonthStart] = useState(() => getMonthStart(today))
  const [goal, setGoal] = useState<MonthlyGoal | null>(null)
  const [editingGoal, setEditingGoal] = useState(false)
  const [tasksByDate, setTasksByDate] = useState<Record<string, CalTask[]>>({})
  const [notesByDate, setNotesByDate] = useState<Record<string, DailyNote>>({})
  const [routines, setRoutines] = useState<Routine[]>([])
  const [routineLogs, setRoutineLogs] = useState<RoutineLog[]>([])

  const monthDates = getMonthDates(monthStart)
  const lastDate = monthDates[monthDates.length - 1]

  const load = useCallback(async () => {
    const [g, r, calTasks, notes, logs] = await Promise.all([
      getMonthlyGoal(monthStart),
      getRoutines(),
      getTasksInRange(monthStart, lastDate),
      getDailyNotesInRange(monthStart, lastDate),
      getRoutineLogs(monthDates),
    ])

    setGoal(g)
    setRoutines(r)
    setRoutineLogs(logs)

    const byDate: Record<string, CalTask[]> = {}
    for (const t of calTasks) {
      if (!byDate[t.date]) byDate[t.date] = []
      byDate[t.date].push(t)
    }
    setTasksByDate(byDate)

    const noteMap: Record<string, DailyNote> = {}
    for (const n of notes) noteMap[n.date] = n
    setNotesByDate(noteMap)
  }, [monthStart])

  useEffect(() => { load() }, [load])

  function handleGoalBlur() {
    setEditingGoal(false)
    if (goal) upsertMonthlyGoal(monthStart, goal.title)
  }

  // Stats derived from loaded data
  const allCalTasks = Object.values(tasksByDate).flat()
  const taskTotal = allCalTasks.length
  const taskDone = allCalTasks.filter(t => t.completed).length
  const taskPct = taskTotal > 0 ? Math.round((taskDone / taskTotal) * 100) : null

  const activeSlots = routines.reduce(
    (n, r) => n + monthDates.filter(d => isRoutineActiveOnDate(r.days, d)).length, 0
  )
  const doneLogs = routineLogs.filter(l => l.completed).length
  const routinePct = activeSlots > 0 ? Math.round((doneLogs / activeSlots) * 100) : null

  const daysPassed = monthDates.filter(d => d <= today).length
  const daysLogged = monthDates.filter(d => d <= today && notesByDate[d]).length

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: 28 }}>

      {/* HEADER */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>

          {/* Month navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setMonthStart(m => addMonths(m, -1))}
              style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-dim)', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
            >‹</button>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 52, color: 'var(--border)', lineHeight: 1, userSelect: 'none', minWidth: 52, textAlign: 'center' }}>
              {new Date(monthStart + 'T12:00:00').getMonth() + 1}
            </div>
            <button
              onClick={() => setMonthStart(m => addMonths(m, 1))}
              style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-dim)', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
            >›</button>
          </div>

          {/* Goal */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6 }}>
              {formatMonthName(monthStart)}
            </div>
            {editingGoal ? (
              <input
                autoFocus
                value={goal?.title ?? ''}
                onChange={e => setGoal(g => g
                  ? { ...g, title: e.target.value }
                  : { id: '', month_start: monthStart, title: e.target.value, updated_at: '' }
                )}
                onBlur={handleGoalBlur}
                onKeyDown={e => { if (e.key === 'Enter') handleGoalBlur() }}
                style={{ fontFamily: 'Georgia, serif', fontSize: 19, fontStyle: 'italic', color: 'var(--text)', background: 'none', border: 'none', outline: 'none', width: '100%' }}
              />
            ) : (
              <div
                onClick={() => setEditingGoal(true)}
                style={{ fontFamily: 'Georgia, serif', fontSize: 19, fontStyle: 'italic', color: goal?.title ? 'var(--text)' : 'var(--text-dim)', cursor: 'text' }}
              >
                {goal?.title || 'Click to set your intention for this month…'}
              </div>
            )}
          </div>

          {/* Stat chips */}
          <div style={{ display: 'flex', gap: 24 }}>
            {[
              { n: taskPct !== null ? `${taskPct}%` : '—', l: 'Tasks' },
              { n: routinePct !== null ? `${routinePct}%` : '—', l: 'Routines' },
              { n: daysPassed > 0 ? `${daysLogged}/${daysPassed}` : '—', l: 'Logged' },
            ].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: 'var(--gold)', lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: 3 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CALENDAR */}
      <div style={{ marginBottom: 16 }}>
        <MonthCalendar monthStart={monthStart} tasksByDate={tasksByDate} notesByDate={notesByDate} />
      </div>

      {/* MONTHLY TASKS */}
      <div style={{ marginBottom: 16 }}>
        <MonthlyTasks monthStart={monthStart} />
      </div>

      {/* HABIT HEATMAP */}
      <HabitHeatmap dates={monthDates} routines={routines} logs={routineLogs} />
    </div>
  )
}
