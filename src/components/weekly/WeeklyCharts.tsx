'use client'
import { useState, useEffect } from 'react'
import { getWeeklyGoalItems, getWeeklyTasks } from '@/lib/db'
import { isRoutineActiveOnDate } from '@/lib/utils'
import { CATEGORIES, CATEGORY_COLOR, ROUTINE_PALETTE } from '@/lib/constants'
import type { Task, Routine, RoutineLog, WeeklyGoalItem, WeeklyTask } from '@/lib/types'
import { CompletionRing } from '@/components/ChartPrimitives'

type Seg = { key: string; label: string; color: string; done: number; total: number }

function catSegments<T extends { category?: string | null; completed: boolean }>(items: T[]): Seg[] {
  const segs: Seg[] = CATEGORIES.map(cat => ({
    key: cat.key, label: cat.label, color: CATEGORY_COLOR[cat.key],
    done: items.filter(t => t.category === cat.key && t.completed).length,
    total: items.filter(t => t.category === cat.key).length,
  })).filter(s => s.total > 0)
  const otherTotal = items.filter(t => !t.category).length
  if (otherTotal > 0) segs.push({
    key: 'other', label: 'Other', color: '#6b6b7e',
    done: items.filter(t => !t.category && t.completed).length,
    total: otherTotal,
  })
  return segs
}

interface Props {
  weekStart: string
  dates: string[]
  dayTasks: Record<string, Task[]>
  routines: Routine[]
  logs: RoutineLog[]
}

export default function WeeklyCharts({ weekStart, dates, dayTasks, routines, logs }: Props) {
  const [goalItems, setGoalItems] = useState<WeeklyGoalItem[]>([])
  const [weeklyTasks, setWeeklyTasks] = useState<WeeklyTask[]>([])

  useEffect(() => {
    getWeeklyGoalItems(weekStart).then(setGoalItems)
    getWeeklyTasks(weekStart).then(setWeeklyTasks)
  }, [weekStart])

  const allDayTasks = Object.values(dayTasks).flat()
  const activeSlots = routines.reduce((n, r) => n + dates.filter(d => isRoutineActiveOnDate(r.days, d)).length, 0)

  const routineSegs: Seg[] = routines.map((r, i) => ({
    key: r.id, label: r.name,
    color: r.color ?? ROUTINE_PALETTE[i % ROUTINE_PALETTE.length],
    done: logs.filter(l => l.routine_id === r.id && l.completed && dates.includes(l.date)).length,
    total: dates.filter(d => isRoutineActiveOnDate(r.days, d)).length,
  })).filter(s => s.total > 0)

  const hasData = allDayTasks.length > 0 || weeklyTasks.length > 0 || goalItems.length > 0 || activeSlots > 0
  if (!hasData) return null

  const rings = [
    allDayTasks.length > 0   && { segs: catSegments(allDayTasks),  label: 'Daily Tasks' },
    weeklyTasks.length > 0   && { segs: catSegments(weeklyTasks),  label: 'Weekly Tasks' },
    goalItems.length > 0     && { segs: catSegments(goalItems),    label: 'Goals' },
    routineSegs.length > 0   && { segs: routineSegs,               label: 'Routines' },
  ].filter(Boolean) as { segs: Seg[]; label: string }[]

  // Categories actually in use this week
  const usedCats = CATEGORIES.filter(cat =>
    allDayTasks.some(t => t.category === cat.key) ||
    weeklyTasks.some(t => t.category === cat.key) ||
    goalItems.some(g => g.category === cat.key)
  )

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 16, flexWrap: 'wrap' }}>
        <div className="card-title" style={{ margin: 0 }}>✦ Weekly Progress</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginLeft: 'auto' }}>
          {usedCats.map(cat => (
            <div key={cat.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: cat.color }} />
              <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>{cat.label}</span>
            </div>
          ))}
          {usedCats.length > 0 && routineSegs.length > 0 && (
            <div style={{ width: 1, height: 12, background: 'var(--border)', flexShrink: 0 }} />
          )}
          {routineSegs.map(r => (
            <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: r.color }} />
              <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>{r.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: rings.length >= 3 ? 'space-evenly' : 'flex-start',
        gap: rings.length < 3 ? 32 : 0,
        flexWrap: 'wrap',
        alignItems: 'flex-start',
      }}>
        {rings.map(({ segs, label }) => (
          <CompletionRing key={label} segments={segs} label={label} size={110} />
        ))}
      </div>
    </div>
  )
}
