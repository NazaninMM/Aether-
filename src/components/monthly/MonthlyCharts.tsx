'use client'
import { useState, useEffect } from 'react'
import { getMonthlyTasks } from '@/lib/db'
import { isRoutineActiveOnDate } from '@/lib/utils'
import { CATEGORIES, CATEGORY_COLOR, ROUTINE_PALETTE } from '@/lib/constants'
import type { Routine, RoutineLog, MonthlyTask } from '@/lib/types'
import { CompletionRing } from '@/components/ChartPrimitives'

type CalTask = { id: string; date: string; title: string; completed: boolean; category?: string | null }
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
  monthStart: string
  monthDates: string[]
  tasksByDate: Record<string, CalTask[]>
  routines: Routine[]
  routineLogs: RoutineLog[]
}

export default function MonthlyCharts({ monthStart, monthDates, tasksByDate, routines, routineLogs }: Props) {
  const [monthlyTasks, setMonthlyTasks] = useState<MonthlyTask[]>([])

  useEffect(() => { getMonthlyTasks(monthStart).then(setMonthlyTasks) }, [monthStart])

  const allDayTasks = Object.values(tasksByDate).flat()
  const activeSlots = routines.reduce((n, r) => n + monthDates.filter(d => isRoutineActiveOnDate(r.days, d)).length, 0)

  const routineSegs: Seg[] = routines.map((r, i) => ({
    key: r.id, label: r.name,
    color: r.color ?? ROUTINE_PALETTE[i % ROUTINE_PALETTE.length],
    done: routineLogs.filter(l => l.routine_id === r.id && l.completed && monthDates.includes(l.date)).length,
    total: monthDates.filter(d => isRoutineActiveOnDate(r.days, d)).length,
  })).filter(s => s.total > 0)

  const hasData = allDayTasks.length > 0 || monthlyTasks.length > 0 || activeSlots > 0
  if (!hasData) return null

  const rings = [
    allDayTasks.length > 0   && { segs: catSegments(allDayTasks),   label: 'Daily Tasks' },
    monthlyTasks.length > 0  && { segs: catSegments(monthlyTasks),  label: 'Month Tasks' },
    routineSegs.length > 0   && { segs: routineSegs,                label: 'Routines' },
  ].filter(Boolean) as { segs: Seg[]; label: string }[]

  const usedCats = CATEGORIES.filter(cat =>
    allDayTasks.some(t => t.category === cat.key) ||
    monthlyTasks.some(t => t.category === cat.key)
  )

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 16, flexWrap: 'wrap' }}>
        <div className="card-title" style={{ margin: 0 }}>✦ Monthly Progress</div>
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
