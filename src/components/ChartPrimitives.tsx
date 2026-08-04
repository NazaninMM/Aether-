'use client'

export function Ring({
  pct, label, sublabel, color,
}: {
  pct: number; label: string; sublabel?: string; color: string
}) {
  const size = 80
  const stroke = 7
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = (Math.min(pct, 100) / 100) * circ

  return (
    <div style={{ textAlign: 'center', flexShrink: 0 }}>
      <svg width={size} height={size} style={{ display: 'block', margin: '0 auto' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        {pct > 0 && (
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        )}
        <text
          x={size / 2} y={size / 2 - (sublabel ? 6 : 0)}
          textAnchor="middle" dy="0.35em"
          fill="var(--text)" fontSize={13}
          fontFamily="Georgia, serif" fontWeight="600"
        >
          {pct}%
        </text>
        {sublabel && (
          <text
            x={size / 2} y={size / 2 + 10}
            textAnchor="middle" dy="0.35em"
            fill="var(--text-dim)" fontSize={9}
          >
            {sublabel}
          </text>
        )}
      </svg>
      <div style={{
        fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase',
        color: 'var(--text-dim)', marginTop: 6,
      }}>
        {label}
      </div>
    </div>
  )
}

// Completion ring: ring fills only the completed fraction, that fraction is split by routine color.
// e.g. 4/12 done (33% colored), split 2+2 → first 50% of colored arc is color A, second 50% is color B.
export function CompletionRing({
  segments, label, size = 88,
}: {
  segments: { key: string; label: string; color: string; done: number; total: number }[]
  label: string
  size?: number
}) {
  const stroke = 8
  const cx = size / 2
  const cy = size / 2
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const GAP = 2

  const totalDone = segments.reduce((s, seg) => s + seg.done, 0)
  const totalSlots = segments.reduce((s, seg) => s + seg.total, 0)

  if (totalSlots === 0) return null

  const pct = Math.round((totalDone / totalSlots) * 100)

  // Each segment's arc length is proportional to its done count relative to ALL slots
  // so that together they fill exactly (totalDone/totalSlots) of the ring.
  let cumAngle = 0

  return (
    <div style={{ textAlign: 'center', flexShrink: 0 }}>
      <svg width={size} height={size} style={{ display: 'block', margin: '0 auto' }}>
        {/* Background ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        {/* One arc per routine, each covering (done/totalSlots) of the circumference */}
        {segments.filter(s => s.done > 0).map(seg => {
          const startAngle = cumAngle - 90
          const segDeg = (seg.done / totalSlots) * 360
          cumAngle += segDeg
          const segLen = Math.max(0, (seg.done / totalSlots) * circ - GAP)
          return (
            <circle
              key={seg.key}
              cx={cx} cy={cy} r={r}
              fill="none" stroke={seg.color} strokeWidth={stroke}
              strokeDasharray={`${segLen} ${circ}`}
              strokeDashoffset={0}
              transform={`rotate(${startAngle}, ${cx}, ${cy})`}
            />
          )
        })}
        {/* Center: overall % */}
        <text x={cx} y={cx - 6} textAnchor="middle" dy="0.35em" fill="var(--text)" fontSize={13} fontFamily="Georgia, serif" fontWeight="600">
          {pct}%
        </text>
        <text x={cx} y={cx + 8} textAnchor="middle" dy="0.35em" fill="var(--text-dim)" fontSize={9}>
          {totalDone}/{totalSlots}
        </text>
      </svg>
      <div style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: 8 }}>
        {label}
      </div>
    </div>
  )
}

// Multi-segment donut: each segment is a category or routine slice
export function MultiRing({
  segments, label, size = 88, centerText,
}: {
  segments: { key: string; label: string; color: string; value: number }[]
  label: string
  size?: number
  centerText?: string // override the center label (default: sum of segment values)
}) {
  const stroke = 8
  const cx = size / 2
  const cy = size / 2
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const GAP = 3 // gap between segments in px along circumference

  const total = segments.reduce((s, seg) => s + seg.value, 0)
  if (total === 0) return null

  let cumAngle = 0

  return (
    <div style={{ textAlign: 'center', flexShrink: 0 }}>
      <svg width={size} height={size} style={{ display: 'block', margin: '0 auto' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        {segments.filter(s => s.value > 0).map(seg => {
          const startAngle = cumAngle - 90
          cumAngle += (seg.value / total) * 360
          const segLen = Math.max(0, (seg.value / total) * circ - GAP)
          return (
            <circle
              key={seg.key}
              cx={cx} cy={cy} r={r}
              fill="none" stroke={seg.color} strokeWidth={stroke}
              strokeDasharray={`${segLen} ${circ}`}
              strokeDashoffset={0}
              transform={`rotate(${startAngle}, ${cx}, ${cy})`}
            />
          )
        })}
        <text
          x={cx} y={cy}
          textAnchor="middle" dy="0.35em"
          fill="var(--text)" fontSize={13}
          fontFamily="Georgia, serif" fontWeight="600"
        >
          {centerText ?? total}
        </text>
      </svg>
      {/* Color legend */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
        gap: '3px 8px', marginTop: 8, maxWidth: size + 20,
      }}>
        {segments.filter(s => s.value > 0).map(seg => (
          <div key={seg.key} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: 8, color: 'var(--text-dim)' }}>
              {seg.label.charAt(0).toUpperCase() + seg.label.slice(1, 4)} {seg.value}
            </span>
          </div>
        ))}
      </div>
      <div style={{
        fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase',
        color: 'var(--text-dim)', marginTop: 5,
      }}>
        {label}
      </div>
    </div>
  )
}
