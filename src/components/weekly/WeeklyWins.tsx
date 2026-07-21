'use client'
import { useState } from 'react'
import { addWeeklyWin, deleteWeeklyWin } from '@/lib/db'
import type { WeeklyWin } from '@/lib/types'

interface Props {
  weekStart: string
  wins: WeeklyWin[]
  onRefresh: () => void
}

export default function WeeklyWins({ weekStart, wins, onRefresh }: Props) {
  const [adding, setAdding] = useState(false)
  const [content, setContent] = useState('')
  const [dayLabel, setDayLabel] = useState('')

  async function handleAdd() {
    const c = content.trim()
    if (!c) { setAdding(false); return }
    await addWeeklyWin(weekStart, c, dayLabel.trim() || undefined)
    setContent(''); setDayLabel(''); setAdding(false)
    onRefresh()
  }

  async function handleDelete(id: string) {
    await deleteWeeklyWin(id)
    onRefresh()
  }

  return (
    <div className="card">
      <div className="card-title">✦ Wins This Week</div>

      {wins.length === 0 && (
        <div style={{ fontSize: 11, color: 'var(--text-dim)', fontStyle: 'italic', padding: '4px 0' }}>No wins recorded yet — add your first one!</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {wins.map(win => (
          <div key={win.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderLeft: '2px solid var(--wins-color)', borderRadius: '0 8px 8px 0' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: 'var(--text)' }}>{win.content}</div>
              {win.day_label && <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>{win.day_label}</div>}
            </div>
            <button onClick={() => handleDelete(win.id)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 14, flexShrink: 0, padding: 0 }}>×</button>
          </div>
        ))}
      </div>

      {adding ? (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <textarea autoFocus value={content} onChange={e => setContent(e.target.value)} placeholder="Describe the win…" rows={2}
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', color: 'var(--text)', fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'inherit' }} />
          <input value={dayLabel} onChange={e => setDayLabel(e.target.value)} placeholder="Day (e.g. Monday) — optional"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', color: 'var(--text)', fontSize: 12, outline: 'none' }} />
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleAdd} style={{ flex: 1, background: 'var(--gold)', border: 'none', borderRadius: 6, color: '#fff', padding: '6px', fontSize: 12, cursor: 'pointer' }}>Add</button>
            <button onClick={() => setAdding(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-dim)', padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="add-btn" onClick={() => setAdding(true)}>+ add win</button>
      )}
    </div>
  )
}
