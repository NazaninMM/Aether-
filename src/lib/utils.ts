export function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayStr(): string {
  return toDateStr(new Date())
}

export function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return toDateStr(d)
}

export function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDay()          // 0=Sun
  const diff = day === 0 ? -6 : 1 - day  // shift to Monday
  d.setDate(d.getDate() + diff)
  return toDateStr(d)
}

export function getWeekDates(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
}

export function formatDate(dateStr: string): { day: string; full: string; weekday: string; short: string } {
  const d = new Date(dateStr + 'T12:00:00')
  return {
    day: String(d.getDate()),
    weekday: d.toLocaleDateString('en-US', { weekday: 'long' }),
    full: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    short: d.toLocaleDateString('en-US', { weekday: 'short' }),
  }
}

export function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart + 'T12:00:00')
  const end = new Date(weekStart + 'T12:00:00')
  end.setDate(end.getDate() + 6)
  const s = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const e = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${s} – ${e}`
}

export function getWeekNumber(dateStr: string): number {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  const yearStart = new Date(d.getFullYear(), 0, 1)
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

export function isRoutineActiveOnDate(days: number[] | null, dateStr: string): boolean {
  if (!days) return true
  const dow = new Date(dateStr + 'T12:00:00').getDay()
  return days.includes(dow)
}

export function computeStreak(logs: { date: string; completed: boolean }[]): number {
  const sorted = [...logs].filter(l => l.completed).map(l => l.date).sort().reverse()
  if (!sorted.length) return 0
  let streak = 0
  let expected = todayStr()
  for (const d of sorted) {
    if (d === expected) {
      streak++
      expected = addDays(expected, -1)
    } else if (d < expected) {
      break
    }
  }
  return streak
}

export const MOOD_LABELS = ['', 'great', 'okay', 'low'] as const
export const MOOD_COLORS = ['', 'var(--green)', 'var(--amber)', 'var(--event-color)'] as const

export function getMonthStart(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

export function addMonths(monthStart: string, n: number): string {
  const d = new Date(monthStart + 'T12:00:00')
  d.setMonth(d.getMonth() + n)
  return getMonthStart(toDateStr(d))
}

export function getMonthDates(monthStart: string): string[] {
  const d = new Date(monthStart + 'T12:00:00')
  const year = d.getFullYear()
  const month = d.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, i) => toDateStr(new Date(year, month, i + 1)))
}

export function formatMonthName(monthStart: string): string {
  const d = new Date(monthStart + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function calendarPadding(monthStart: string): number {
  const dow = new Date(monthStart + 'T12:00:00').getDay()
  return dow === 0 ? 6 : dow - 1  // Mon-based; Mon=0
}
