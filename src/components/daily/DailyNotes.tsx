'use client'
import { useState, useEffect, useRef } from 'react'
import { getDailyNote, upsertDailyNote } from '@/lib/db'
import { MOOD_LABELS, MOOD_COLORS } from '@/lib/utils'

export default function DailyNotes({ date }: { date: string }) {
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<1 | 2 | 3>(1)
  const [energy, setEnergy] = useState(3)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    getDailyNote(date).then(n => {
      if (n) { setContent(n.content); setMood(n.mood as 1|2|3); setEnergy(n.energy) }
      else { setContent(''); setMood(1); setEnergy(3) }
    })
  }, [date])

  function save(c: string, m: number, e: number) {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => upsertDailyNote(date, c, m, e), 800)
  }

  function handleContent(v: string) { setContent(v); save(v, mood, energy) }
  function handleMood(m: 1|2|3) { setMood(m); save(content, m, energy) }
  function handleEnergy(e: number) { setEnergy(e); save(content, mood, e) }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="card-title">✦ Notes & Reflection</div>
      <textarea
        value={content}
        onChange={e => handleContent(e.target.value)}
        placeholder="Write anything — thoughts, wins, blockers, ideas…"
        style={{
          width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 7, color: 'var(--text)', padding: '10px 12px',
          fontSize: 12, fontFamily: 'Georgia, serif', lineHeight: 1.7,
          resize: 'none', outline: 'none', height: 110,
          transition: 'background 0.2s',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 10, color: 'var(--text-dim)', letterSpacing: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ textTransform: 'uppercase' }}>Mood</span>
          {([1, 2, 3] as const).map(m => (
            <button key={m} onClick={() => handleMood(m)} style={{
              border: 'none', cursor: 'pointer', padding: '2px 6px',
              borderRadius: 10, fontSize: 11,
              color: mood === m ? MOOD_COLORS[m] : 'var(--text-dim)',
              background: mood === m ? 'var(--surface-2)' : 'none',
              fontWeight: mood === m ? 600 : 400,
            }}>
              {MOOD_LABELS[m]}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ textTransform: 'uppercase' }}>Energy</span>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3 }}>
            {[1,2,3,4,5].map(e => (
              <button key={e} onClick={() => handleEnergy(e)} style={{
                width: 7,
                height: 6 + e * 4,
                borderRadius: 3,
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                background: e <= energy ? 'var(--gold)' : 'var(--border)',
                opacity: e <= energy ? 1 : 0.5,
                transition: 'background 0.15s, opacity 0.15s',
              }} />
            ))}
          </div>
          <span style={{ color: 'var(--gold)', fontWeight: 500 }}>
            {['', 'low', 'low', 'medium', 'high', 'peak'][energy]}
          </span>
        </div>
      </div>
    </div>
  )
}
