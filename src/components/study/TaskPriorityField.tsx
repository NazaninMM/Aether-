'use client'
import { PRIORITY_COLOR, PRIORITY_CYCLE, type PriorityKey } from '@/lib/constants'

export default function TaskPriorityField({ value, onChange, label = 'Priority' }: {
  value: PriorityKey | null
  onChange: (priority: PriorityKey | null) => void
  label?: string
}) {
  const next = value ? PRIORITY_CYCLE[value] : 'low'
  return (
    <button
      type="button"
      onClick={() => onChange(next)}
      title={`Click to change ${label.toLowerCase()}`}
      aria-label={`${label}: ${value ?? 'none'}. Click to change.`}
      style={{
        border: 'none', borderRadius: 999, padding: '3px 8px', cursor: 'pointer',
        background: value ? `${PRIORITY_COLOR[value]}22` : 'var(--surface-2)',
        color: value ? PRIORITY_COLOR[value] : 'var(--text-dim)',
        fontSize: 10, fontWeight: 600, textTransform: 'capitalize',
      }}
    >
      {value ?? '—'}
    </button>
  )
}
