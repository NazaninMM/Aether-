'use client'
import { useState } from 'react'

export default function DeadlineField({ value, onChange }: {
  value: string | null
  onChange: (value: string | null) => void | Promise<void>
}) {
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  async function save(value: string) {
    setError('')
    setSaving(true)
    try { await onChange(value || null) }
    catch { setError('Could not save deadline. Please try again.') }
    finally { setSaving(false) }
  }
  return (
    <div style={{ fontSize: 11, minWidth: 0 }}>
      <label style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5, color: 'var(--text-dim)' }}>
        Deadline
        <input type="date" value={value ?? ''} disabled={saving} onChange={e => void save(e.target.value)}
          style={{ minWidth: 0, maxWidth: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 5px', color: 'var(--text)', fontSize: 11, fontFamily: 'inherit' }} />
        {value && <button type="button" disabled={saving} onClick={() => void save('')} aria-label="Clear deadline" style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>Clear</button>}
      </label>
      {error && <div role="alert">{error}</div>}
    </div>
  )
}
