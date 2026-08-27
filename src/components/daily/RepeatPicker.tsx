'use client'

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function RepeatDayToggle({ days, onChange }: { days: number[]; onChange: (days: number[]) => void }) {
  const allSelected = days.length === 7

  function toggleDay(d: number) {
    onChange(days.includes(d) ? days.filter(x => x !== d) : [...days, d].sort())
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
      {DAY_LABELS.map((label, i) => (
        <button
          key={i}
          type="button"
          onClick={() => toggleDay(i)}
          style={{
            width: 22, height: 22, borderRadius: '50%', border: '1px solid var(--border)',
            fontSize: 10, cursor: 'pointer', fontFamily: 'inherit',
            background: days.includes(i) ? 'var(--gold)' : 'var(--surface-2)',
            color: days.includes(i) ? '#fff' : 'var(--text-dim)',
          }}
        >
          {label}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(allSelected ? [] : [0, 1, 2, 3, 4, 5, 6])}
        style={{
          marginLeft: 4, fontSize: 10, padding: '3px 8px', borderRadius: 10, fontFamily: 'inherit',
          border: '1px solid var(--border)', cursor: 'pointer',
          background: allSelected ? 'var(--gold)' : 'var(--surface-2)',
          color: allSelected ? '#fff' : 'var(--text-dim)',
        }}
      >
        Every day
      </button>
    </div>
  )
}

export function RepeatBadge({ days, onClick }: { days: number[]; onClick?: () => void }) {
  const label = days.length === 7 ? 'Daily' : days.map(d => DAY_LABELS[d]).join('')
  return (
    <button
      type="button"
      onClick={onClick}
      title="Repeats — click to edit"
      style={{
        border: 'none', cursor: onClick ? 'pointer' : 'default', padding: '2px 7px', borderRadius: 10,
        fontSize: 10, fontWeight: 600, background: 'var(--gold-dim, var(--surface-2))', color: 'var(--gold)',
        flexShrink: 0, fontFamily: 'inherit',
      }}
    >
      ↻ {label}
    </button>
  )
}
