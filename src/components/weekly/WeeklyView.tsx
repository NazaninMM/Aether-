'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getWeeklyGoal, upsertWeeklyGoal, getRoutines, getRoutineLogs, toggleRoutineLog, getWeeklyWins, getTasks } from '@/lib/db'
import { getWeekStart, getWeekDates, addDays, formatDate, formatWeekRange, getWeekNumber, todayStr, isRoutineActiveOnDate } from '@/lib/utils'
import type { WeeklyGoal, WeeklyWin, Routine, RoutineLog, Task } from '@/lib/types'
import RoutineTracker from './RoutineTracker'
import WeeklyWins from './WeeklyWins'
import WeeklySidebar from './WeeklySidebar'
import WeeklyGoals from './WeeklyGoals'
import WeeklyTasks from './WeeklyTasks'

export default function WeeklyView() {
  const router = useRouter()
  const [weekStart, setWeekStart] = useState(() => getWeekStart(todayStr()))
  const [goal, setGoal] = useState<WeeklyGoal | null>(null)
  const [editingGoal, setEditingGoal] = useState(false)
  const [wins, setWins] = useState<WeeklyWin[]>([])
  const [routines, setRoutines] = useState<Routine[]>([])
  const [logs, setLogs] = useState<RoutineLog[]>([])
  const [dayTasks, setDayTasks] = useState<Record<string, Task[]>>({})

  const dates = getWeekDates(weekStart)
  const today = todayStr()
  const weekNum = getWeekNumber(weekStart)

  const load = useCallback(async () => {
    const [g, r, l, w] = await Promise.all([
      getWeeklyGoal(weekStart),
      getRoutines(),
      getRoutineLogs(dates),
      getWeeklyWins(weekStart),
    ])
    setGoal(g); setRoutines(r); setLogs(l); setWins(w)

    const tasksByDay = await Promise.all(dates.map(d => getTasks(d).then(t => [d, t] as const)))
    setDayTasks(Object.fromEntries(tasksByDay))
  }, [weekStart])

  useEffect(() => { load() }, [load])

  async function handleToggleLog(routineId: string, date: string, completed: boolean) {
    await toggleRoutineLog(routineId, date, completed)
    setLogs(ls => {
      const existing = ls.find(l => l.routine_id === routineId && l.date === date)
      if (existing) return ls.map(l => l.routine_id === routineId && l.date === date ? { ...l, completed } : l)
      return [...ls, { id: '', routine_id: routineId, date, completed }]
    })
  }

  function handleGoalBlur() {
    setEditingGoal(false)
    if (goal) upsertWeeklyGoal(weekStart, { title: goal.title })
  }

  const totalTasks = Object.values(dayTasks).flat()
  const doneTasks = totalTasks.filter(t => t.completed)
  const activeRoutineSlots = routines.reduce((n, r) => n + dates.filter(d => isRoutineActiveOnDate(r.days, d)).length, 0)
  const doneLogs = logs.filter(l => l.completed).length
  const routinePct = activeRoutineSlots > 0 ? Math.round((doneLogs / activeRoutineSlots) * 100) : 0
  const taskPct = totalTasks.length > 0 ? Math.round((doneTasks.length / totalTasks.length) * 100) : 0
  const weekProgress = Math.round((routinePct + taskPct) / 2)

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: 28 }}>

      {/* WEEK HEADER */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setWeekStart(w => addDays(w, -7))} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-dim)', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>‹</button>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 56, color: 'var(--border)', lineHeight: 1, userSelect: 'none' }}>{weekNum}</div>
          <button onClick={() => setWeekStart(w => addDays(w, 7))} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-dim)', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>›</button>
        </div>

        <div style={{ flex: 1, margin: '0 24px' }}>
          <div style={{ fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6 }}>
            Week {weekNum} · {formatWeekRange(weekStart)}
          </div>
          {editingGoal ? (
            <input
              autoFocus
              value={goal?.title ?? ''}
              onChange={e => setGoal(g => g ? { ...g, title: e.target.value } : { id: '', week_start: weekStart, title: e.target.value, next_week_focus: '', reflection: '' })}
              onBlur={handleGoalBlur}
              onKeyDown={e => { if (e.key === 'Enter') handleGoalBlur() }}
              style={{ fontFamily: 'Georgia, serif', fontSize: 19, fontStyle: 'italic', color: 'var(--text)', background: 'none', border: 'none', outline: 'none', width: '100%' }}
            />
          ) : (
            <div onClick={() => setEditingGoal(true)} style={{ fontFamily: 'Georgia, serif', fontSize: 19, fontStyle: 'italic', color: goal?.title ? 'var(--text)' : 'var(--text-dim)', cursor: 'text' }}>
              {goal?.title || 'Click to set your focus for this week…'}
            </div>
          )}
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 4 }}>
              <span>Week progress</span><span>{weekProgress}%</span>
            </div>
            <div className="prog-bar"><div className="prog-fill" style={{ width: `${weekProgress}%` }} /></div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20 }}>
          {[{ n: `${doneTasks.length}/${totalTasks.length}`, l: 'Tasks' }, { n: `${routinePct}%`, l: 'Routines' }].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: 'var(--gold)', lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: 3 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* 7-DAY GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
            {dates.map(date => {
              const fmt = formatDate(date)
              const isToday = date === today
              const tasks = dayTasks[date] ?? []
              const done = tasks.filter(t => t.completed).length

              return (
                <div key={date} className="card" onClick={() => router.push(`/daily?date=${date}`)} style={{
                  padding: 14, minHeight: 240, display: 'flex', flexDirection: 'column',
                  borderColor: isToday ? 'var(--gold-dim)' : 'var(--border)',
                  background: isToday ? 'var(--gold-glow)' : 'var(--surface)',
                  cursor: 'pointer',
                }}>
                  <div style={{ paddingBottom: 10, borderBottom: '1px solid var(--border)', marginBottom: 10 }}>
                    <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: isToday ? 'var(--gold)' : 'var(--text-dim)' }}>
                      {fmt.short}{isToday ? ' · today' : ''}
                    </div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: isToday ? 'var(--gold)' : 'var(--text)', lineHeight: 1.2 }}>{fmt.day}</div>
                    {tasks.length > 0 && <div style={{ fontSize: 9, color: 'var(--amber)', marginTop: 2 }}>{done}/{tasks.length} tasks</div>}
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {tasks.slice(0, 5).map(t => (
                      <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 5, fontSize: 11, color: t.completed ? 'var(--text-dim)' : 'var(--text-mid)', lineHeight: 1.4, textDecoration: t.completed ? 'line-through' : 'none' }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--gold-dim)', marginTop: 4, flexShrink: 0 }} />
                        {t.title}
                      </div>
                    ))}
                    {tasks.length > 5 && <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>+{tasks.length - 5} more</div>}
                  </div>
                </div>
              )
            })}
          </div>

          <WeeklyGoals weekStart={weekStart} />
          <WeeklyTasks weekStart={weekStart} />
          <RoutineTracker routines={routines} logs={logs} dates={dates} onToggle={handleToggleLog} />
          <WeeklyWins weekStart={weekStart} wins={wins} onRefresh={() => getWeeklyWins(weekStart).then(setWins)} />
        </div>

        <WeeklySidebar weekStart={weekStart} goal={goal} onGoalChange={g => setGoal(prev => ({ ...(prev ?? { id: '', week_start: weekStart, title: '', next_week_focus: '', reflection: '' }), ...g }))} />
      </div>
    </div>
  )
}
