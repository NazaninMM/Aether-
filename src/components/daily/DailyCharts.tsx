'use client'
import { CATEGORIES, CATEGORY_COLOR } from '@/lib/constants'
import type { Task } from '@/lib/types'
import { CompletionRing } from '@/components/ChartPrimitives'

type Seg = { key: string; label: string; color: string; done: number; total: number }

function taskSegments(tasks: Task[]): Seg[] {
  const segs: Seg[] = CATEGORIES.map(cat => ({
    key: cat.key, label: cat.label, color: CATEGORY_COLOR[cat.key],
    done: tasks.filter(t => t.category === cat.key && t.completed).length,
    total: tasks.filter(t => t.category === cat.key).length,
  })).filter(s => s.total > 0)
  const otherTotal = tasks.filter(t => !t.category).length
  if (otherTotal > 0) segs.push({
    key: 'other', label: 'Other', color: '#6b6b7e',
    done: tasks.filter(t => !t.category && t.completed).length,
    total: otherTotal,
  })
  return segs
}

export default function DailyCharts({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) return null

  const segs = taskSegments(tasks)
  const usedCats = CATEGORIES.filter(cat => tasks.some(t => t.category === cat.key))

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 16, flexWrap: 'wrap' }}>
        <div className="card-title" style={{ margin: 0 }}>✦ Today's Progress</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginLeft: 'auto' }}>
          {usedCats.map(cat => (
            <div key={cat.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: CATEGORY_COLOR[cat.key] }} />
              <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>{cat.label}</span>
            </div>
          ))}
        </div>
      </div>
      <CompletionRing segments={segs} label="Tasks" size={110} />
    </div>
  )
}
