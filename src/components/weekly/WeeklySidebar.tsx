'use client'
import { useState, useRef } from 'react'
import { upsertWeeklyGoal } from '@/lib/db'
import type { WeeklyGoal } from '@/lib/types'

interface Props {
  weekStart: string
  goal: WeeklyGoal | null
  onGoalChange: (g: Partial<WeeklyGoal>) => void
}

export default function WeeklySidebar({ weekStart, goal, onGoalChange }: Props) {
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function saveField(field: keyof WeeklyGoal, value: string) {
    const update = { ...(goal ?? {}), [field]: value }
    onGoalChange(update)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => upsertWeeklyGoal(weekStart, { [field]: value }), 800)
  }

  const chain = [
    { level: 'Life Goal', text: 'Your life goal will appear here' },
    { level: '10-Year',   text: 'Your 10-year goal will appear here' },
    { level: 'This Year', text: 'Your yearly goal will appear here' },
    { level: 'This Week ✦', text: goal?.title || '' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Goal chain */}
      <div className="card">
        <div className="card-title">✦ Goal Chain</div>
        <div>
          {chain.map((item, i) => (
            <div key={i}>
              <div style={{ paddingLeft: 14, borderLeft: `2px solid ${i === chain.length - 1 ? 'var(--gold)' : 'var(--border)'}`, paddingTop: 6, paddingBottom: 6, cursor: i === chain.length - 1 ? 'default' : 'default' }}>
                <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: i === chain.length - 1 ? 'var(--gold)' : 'var(--text-dim)', marginBottom: 3 }}>{item.level}</div>
                <div style={{ fontSize: 12, color: i === chain.length - 1 ? 'var(--text)' : 'var(--text-mid)', lineHeight: 1.4 }}>
                  {item.text || <span style={{ fontStyle: 'italic', color: 'var(--text-dim)' }}>Not set</span>}
                </div>
              </div>
              {i < chain.length - 1 && <div style={{ width: 1, height: 8, background: 'var(--border)', marginLeft: 13 }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Weekly reflection */}
      <div className="card">
        <div className="card-title">✦ Weekly Reflection</div>
        <textarea
          value={goal?.reflection ?? ''}
          onChange={e => saveField('reflection', e.target.value)}
          placeholder="How did this week go? What would you do differently?"
          style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text)', padding: '10px 12px', fontSize: 12, fontFamily: 'Georgia, serif', lineHeight: 1.7, resize: 'none', outline: 'none', height: 110, transition: 'background 0.2s' }}
        />
      </div>

      {/* Next week focus */}
      <div className="card">
        <div className="card-title">✦ Next Week Focus</div>
        <textarea
          value={goal?.next_week_focus ?? ''}
          onChange={e => saveField('next_week_focus', e.target.value)}
          placeholder="What's the main focus for next week?"
          style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text)', padding: '10px 12px', fontSize: 12, fontFamily: 'Georgia, serif', lineHeight: 1.7, resize: 'none', outline: 'none', height: 80, transition: 'background 0.2s' }}
        />
      </div>
    </div>
  )
}
