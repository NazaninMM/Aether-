'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getWeeklyGoal, upsertWeeklyGoal, getRoutines, getRoutineLogs, toggleRoutineLog, getWeeklyWins, getTasks, getTimeBlocksInRange, getEventsInRange } from '@/lib/db'
import { getWeekStart, getWeekDates, addDays, formatDate, formatWeekRange, getWeekNumber, todayStr, isRoutineActiveOnDate, sortByStartTime, fmt24to12 } from '@/lib/utils'
import type { WeeklyGoal, WeeklyWin, Routine, RoutineLog, Task, TimeBlock, Event } from '@/lib/types'
import RoutineTracker from './RoutineTracker'
import WeeklyWins from './WeeklyWins'
import WeeklySidebar from './WeeklySidebar'
import WeeklyGoals from './WeeklyGoals'
import WeeklyTasks from './WeeklyTasks'
import WeeklyCharts from './WeeklyCharts'

export default function WeeklyView({ initialWeek }: { initialWeek?: string }) {
  const router = useRouter()
  const [weekStart, setWeekStart] = useState(() => initialWeek ? getWeekStart(initialWeek) : getWeekStart(todayStr()))
  const [goal, setGoal] = useState<WeeklyGoal | null>(null)
  const [editingGoal, setEditingGoal] = useState(false)
  const [wins, setWins] = useState<WeeklyWin[]>([])
  const [routines, setRoutines] = useState<Routine[]>([])
  const [logs, setLogs] = useState<RoutineLog[]>([])
  const [dayTasks, setDayTasks] = useState<Record<string, Task[]>>({})
  const [dayTimeBlocks, setDayTimeBlocks] = useState<Record<string, TimeBlock[]>>({})
  const [dayEvents, setDayEvents] = useState<Record<string, Event[]>>({})

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

    const [blocks, events] = await Promise.all([getTimeBlocksInRange(dates), getEventsInRange(dates)])
    setDayTimeBlocks(blocks); setDayEvents(events)
  }, [weekStart])

  function scheduleFor(date: string): { id: string; title: string; time_start: string | null; isEvent: boolean }[] {
    const blocks = (dayTimeBlocks[date] ?? []).map(b => ({ id: b.id, title: b.title, time_start: b.time_start, isEvent: b.is_event }))
    const events = (dayEvents[date] ?? []).map(e => ({ id: e.id, title: e.title, time_start: e.time_start, isEvent: true }))
    return sortByStartTime([...blocks, ...events])
  }

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

      {/* CHARTS */}
      <WeeklyCharts weekStart={weekStart} dates={dates} dayTasks={dayTasks} routines={routines} logs={logs} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>

        {/* 7-DAY GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 14 }}>
          {dates.map(date => {
            const fmt = formatDate(date)
            const isToday = date === today
            const tasks = dayTasks[date] ?? []
            const done = tasks.filter(t => t.completed).length
            const schedule = scheduleFor(date)

            return (
              <div key={date} className="card" onClick={() => router.push(`/daily?date=${date}`)} style={{
                padding: 18, minHeight: 340, display: 'flex', flexDirection: 'column',
                borderColor: isToday ? 'var(--gold-dim)' : 'var(--border)',
                background: isToday ? 'var(--gold-glow)' : 'var(--surface)',
                cursor: 'pointer',
              }}>
                <div style={{ paddingBottom: 12, borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
                  <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: isToday ? 'var(--gold)' : 'var(--text-dim)' }}>
                    {fmt.short}{isToday ? ' · today' : ''}
                  </div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 24, color: isToday ? 'var(--gold)' : 'var(--text)', lineHeight: 1.2 }}>{fmt.day}</div>
                  {tasks.length > 0 && <div style={{ fontSize: 9, color: 'var(--amber)', marginTop: 2 }}>{done}/{tasks.length} tasks</div>}
                </div>

                {schedule.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                    {schedule.slice(0, 4).map(s => (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 11, lineHeight: 1.4 }}>
                        <div style={{ width: 3, alignSelf: 'stretch', minHeight: 14, borderRadius: 2, background: s.isEvent ? 'var(--event-color)' : 'var(--gold-dim)', flexShrink: 0, marginTop: 1 }} />
                        <div>
                          {s.time_start && <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>{fmt24to12(s.time_start)}</div>}
                          <div style={{ color: 'var(--text-mid)' }}>{s.title}</div>
                        </div>
                      </div>
                    ))}
                    {schedule.length > 4 && <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>+{schedule.length - 4} more</div>}
                  </div>
                )}

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

        <WeeklySidebar weekStart={weekStart} goal={goal} onGoalChange={g => setGoal(prev => ({ ...(prev ?? { id: '', week_start: weekStart, title: '', next_week_focus: '', reflection: '' }), ...g }))} />

        <WeeklyGoals weekStart={weekStart} />
        <WeeklyTasks weekStart={weekStart} />
        <RoutineTracker routines={routines} logs={logs} dates={dates} onToggle={handleToggleLog} />
        <WeeklyWins weekStart={weekStart} wins={wins} onRefresh={() => getWeeklyWins(weekStart).then(setWins)} />
      </div>
    </div>
  )
}
