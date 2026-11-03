'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getMonthOverviewTasks } from '@/lib/db'
import type { MonthOverviewTask } from '@/lib/types'
import { formatMonthName, formatWeekRange, getMonthDates } from '@/lib/utils'

function formatDate(date: string) {
  return new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function taskHref(task: MonthOverviewTask) {
  if (task.source === 'daily') return `/daily?date=${task.scheduled_date}`
  if (task.source === 'weekly') return `/weekly?week=${task.scheduled_date}`
  return `/monthly?month=${task.scheduled_date}`
}

export default function MonthlyTaskOverview({ monthStart, revision }: { monthStart: string; revision: number }) {
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

  return (
    <section className="card" aria-label="Monthly task overview" aria-busy={loading}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
        <div className="card-title" style={{ margin: 0 }}>All Tasks This Month</div>
        {!loading && !state.error && <span style={{ fontSize: 11, color: 'var(--amber)' }}>{tasks.length - done} remaining / {tasks.length} total</span>}
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '8px 0 14px' }}>
        Daily, weekly, and monthly tasks scheduled for or due in {formatMonthName(monthStart)}.
      </p>
      {loading ? <p role="status">Loading tasks...</p> : state.error ? (
        <div role="alert">
          {state.error} <button type="button" onClick={() => { setState(null); setRetry(n => n + 1) }}>Retry</button>
        </div>
      ) : tasks.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>No tasks scheduled for or due this month.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {tasks.map(task => (
            <li key={`${task.source}:${task.id}`} style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '6px 16px', padding: '12px 0', borderTop: '1px solid var(--border)' }}>
              <div style={{ flex: '1 1 240px', minWidth: 0 }}>
                <Link href={taskHref(task)} style={{ fontSize: 13, overflowWrap: 'anywhere', color: task.completed ? 'var(--text-dim)' : 'var(--text)', textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</Link>
                <div style={{ marginTop: 4, fontSize: 11, color: 'var(--text-dim)' }}>
                  {task.source === 'daily' ? `Daily / ${formatDate(task.scheduled_date)}` : task.source === 'weekly' ? `Weekly / ${formatWeekRange(task.scheduled_date)}` : `Monthly / ${formatMonthName(task.scheduled_date)}`}
                  {task.category && ` / ${task.category}`}
                </div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{task.deadline ? `Due ${formatDate(task.deadline)}` : 'No deadline'}</span>
              <span style={{ fontSize: 11, color: task.completed ? 'var(--green)' : 'var(--amber)' }}>{task.completed ? 'Completed' : 'To do'}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
