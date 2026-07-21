'use client'
import { useState, useEffect, useRef } from 'react'
import { getDailyGoal, upsertDailyGoal } from '@/lib/db'

export default function GoalOfDay({ date }: { date: string }) {
  const [title, setTitle] = useState('')
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    getDailyGoal(date).then(async g => {
      if (g?.title) {
        setTitle(g.title)
      } else {
        setLoading(true)
        try {
          const res = await fetch(`/api/inspire?date=${encodeURIComponent(date)}`)
          const { sentence } = await res.json()
          if (sentence) {
            setTitle(sentence)
            upsertDailyGoal(date, sentence)
          }
        } finally {
          setLoading(false)
        }
      }
    })
  }, [date])

  function handleBlur() {
    setEditing(false)
    if (title) upsertDailyGoal(date, title)
  }

  useEffect(() => { if (editing) ref.current?.focus() }, [editing])

  return (
    <div className="card" style={{
      flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      background: 'linear-gradient(145deg, var(--surface) 30%, var(--surface-2) 100%)',
      borderTop: '2px solid var(--gold-dim)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', bottom: -20, right: 14,
        fontFamily: 'Georgia, serif', fontSize: 110,
        color: 'var(--gold)', opacity: 0.05, lineHeight: 1,
        pointerEvents: 'none', userSelect: 'none', transform: 'rotate(180deg)',
      }}>❝</div>
      <div style={{ fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--gold)', opacity: 0.8, marginBottom: 8 }}>
        ✦ Intention of the Day
      </div>
      {editing ? (
        <textarea
          ref={ref}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleBlur() } }}
          rows={2}
          placeholder="What's your intention for today?"
          style={{
            background: 'none', border: 'none', color: 'var(--text)',
            fontFamily: 'Georgia, serif', fontSize: 20, fontStyle: 'italic',
            lineHeight: 1.45, resize: 'none', outline: 'none', width: '100%',
          }}
        />
      ) : (
        <div
          onClick={() => !loading && setEditing(true)}
          style={{
            fontFamily: 'Georgia, serif', fontSize: 20, fontStyle: 'italic',
            color: loading ? 'var(--text-dim)' : title ? 'var(--text)' : 'var(--text-dim)',
            lineHeight: 1.45, cursor: loading ? 'default' : 'text', minHeight: 56,
            opacity: loading ? 0.5 : 1, transition: 'opacity 0.3s',
          }}
        >
          {loading ? 'Generating your intention…' : title || 'Click to set your intention for today…'}
        </div>
      )}
    </div>
  )
}
