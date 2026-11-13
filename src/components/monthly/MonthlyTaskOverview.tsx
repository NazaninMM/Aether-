'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getMonthOverviewTasks, updateTask, updateWeeklyTask, updateMonthlyTask } from '@/lib/db'
import { CATEGORIES, PRIORITY_COLOR } from '@/lib/constants'
import type { MonthOverviewTask } from '@/lib/types'
import { formatMonthName, formatWeekRange, getMonthDates } from '@/lib/utils'

function formatDate(date: string) {
  return new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function taskHref(task: MonthOverviewTask) {
  if (task.source === 'daily') return `/daily?date=${task.scheduled_date}`
  if (task.source === 'weekly') return `/weekly?week=${task.scheduled_date}`
  return `/monthly?month=${task.scheduled_date}`
}

export default function MonthlyTaskOverview({ monthStart, revision, onTaskChange }: {
  monthStart: string
  revision: number
  onTaskChange: (task: MonthOverviewTask) => void
}) {
  const pendingRef = useRef(new Set<string>())
  const [pending, setPending] = useState<Set<string>>(new Set())
  const [saveError, setSaveError] = useState('')

  async function toggle(task: MonthOverviewTask) {
    const key = `${task.source}:${task.id}`
    if (pendingRef.current.has(key)) return
    pendingRef.current.add(key)
    setPending(new Set(pendingRef.current))
    setSaveError('')
    try {
      const update = task.source === 'daily' ? updateTask : task.source === 'weekly' ? updateWeeklyTask : updateMonthlyTask
      const completed = !task.completed
      const { error } = await update(task.id, { completed })
      if (error) throw error
      setState(current => current ? { ...current, tasks: current.tasks.map(item =>
        item.id === task.id && item.source === task.source ? { ...item, completed } : item
      ) } : current)
      onTaskChange({ ...task, completed })
    } catch {
      setSaveError(`Could not update "${task.title}". Please try again.`)
    } finally {
      pendingRef.current.delete(key)
      setPending(new Set(pendingRef.current))
    }
  }
  const [state, setState] = useState<{
    month: string; revision: number; tasks: MonthOverviewTask[]; error: string
  } | null>(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let active = true
    const dates = getMonthDates(monthStart)
    getMonthOverviewTasks(monthStart, dates[dates.length - 1]).then(
      tasks => { if (active) setState({ month: monthStart, revision, tasks, error: '' }) },
      () => { if (active) setState({ month: monthStart, revision, tasks: [], error: 'Could not load tasks. Please try again.' }) },
    )
    return () => { active = false }
  }, [monthStart, revision, retry])

  const loading = !state || state.month !== monthStart || state.revision !== revision
  const tasks = loading ? [] : state.tasks
  const done = tasks.filter(task => task.completed).length
  const groups = [
    ...CATEGORIES,
    { key: 'uncategorized', label: 'Uncategorized', color: 'var(--text-dim)' },
  ].map(category => ({
    ...category,
    tasks: tasks.filter(task => (task.category ?? 'uncategorized') === category.key)
      .sort((a, b) => Number(a.completed) - Number(b.completed)
        || (a.deadline ?? '9999-12-31').localeCompare(b.deadline ?? '9999-12-31')
        || a.scheduled_date.localeCompare(b.scheduled_date)
        || a.title.localeCompare(b.title)),
  })).filter(group => group.tasks.length > 0)

  return (
    <section className="card" aria-label="Monthly task overview" aria-busy={loading}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
        <div className="card-title" style={{ margin: 0 }}>All Tasks This Month</div>
        {!loading && !state.error && <span style={{ fontSize: 11, color: 'var(--amber)' }}>{tasks.length - done} remaining / {tasks.length} total</span>}
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '8px 0 14px' }}>
        Daily, weekly, and monthly tasks scheduled for or due in {formatMonthName(monthStart)}.
      </p>
      {saveError && <p role="alert" style={{ fontSize: 12 }}>{saveError}</p>}
      {loading ? <p role="status">Loading tasks...</p> : state.error ? (
        <div role="alert">
          {state.error} <button type="button" onClick={() => { setState(null); setRetry(n => n + 1) }}>Retry</button>
        </div>
      ) : tasks.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>No tasks scheduled for or due this month.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '16px 24px' }}>
          {groups.map(group => (
            <section key={group.key} aria-label={`${group.label} tasks`} style={{ minWidth: 0 }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 5px', paddingBottom: 6, borderBottom: `2px solid ${group.color}`, color: group.color, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>
                {group.label}
                <span style={{ marginLeft: 'auto', color: 'var(--text-dim)', fontSize: 10, fontWeight: 400, letterSpacing: 0 }}>
                  {group.tasks.filter(task => task.completed).length}/{group.tasks.length} done
                </span>
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {group.tasks.map(task => (
                  <li key={`${task.source}:${task.id}`} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      disabled={pending.has(`${task.source}:${task.id}`)}
                      onChange={() => void toggle(task)}
                      aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                      style={{ margin: 0, width: 14, height: 14, flexShrink: 0, accentColor: group.color, cursor: 'pointer' }}
                    />
                    <Link href={taskHref(task)} title={task.source === 'weekly' ? formatWeekRange(task.scheduled_date) : formatDate(task.scheduled_date)} style={{ flex: 1, minWidth: 0, fontSize: 12, overflowWrap: 'anywhere', color: task.completed ? 'var(--text-dim)' : 'var(--text)', textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</Link>
                    {task.course && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 9, padding: '2px 6px', borderRadius: 999, background: `${task.course.color}22`, color: task.course.color }}><span style={{ width: 5, height: 5, flexShrink: 0, borderRadius: '50%', background: task.course.color }} />{task.course.name}</span>}
                    {task.priority && <span style={{ fontSize: 9, padding: '2px 5px', borderRadius: 999, background: `${PRIORITY_COLOR[task.priority]}22`, color: PRIORITY_COLOR[task.priority], textTransform: 'capitalize' }}>{task.priority}</span>}
                    <span style={{ fontSize: 9, padding: '2px 4px', borderRadius: 4, background: 'var(--surface-2)', color: 'var(--text-dim)', textTransform: 'capitalize', flexShrink: 0 }}>{task.source}</span>
                    {task.deadline && <span style={{ fontSize: 10, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>Due {formatDate(task.deadline)}</span>}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  )
}
