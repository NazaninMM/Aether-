'use client'
import { useState } from 'react'
import styles from './MoveTaskDatePicker.module.css'

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function shiftMonth(value: string, amount: number) {
  const [year, month] = value.split('-').map(Number)
  const next = new Date(year, month - 1 + amount, 1, 12)
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`
}

export default function MoveTaskDatePicker({ currentDate, taskTitle, onChoose }: {
  currentDate: string
  taskTitle: string
  onChoose: (date: string) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(currentDate.slice(0, 7))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [year, monthNumber] = month.split('-').map(Number)
  const firstDay = new Date(year, monthNumber - 1, 1, 12)
  const gridStart = new Date(year, monthNumber - 1, 1 - ((firstDay.getDay() + 6) % 7), 12)
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + index)
    return date
  })

  async function chooseDate(date: string) {
    setSaving(true)
    setError('')
    try {
      await onChoose(date)
      setOpen(false)
    } catch {
      setError('Could not move this task. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.movePicker}>
      <button
        type="button"
        className={styles.trigger}
        title="Move to another day"
        aria-label={`Choose a day to move ${taskTitle}`}
        aria-expanded={open}
        onClick={() => { setOpen(value => !value); setError('') }}
      >
        →
      </button>
      {open && (
        <div className={styles.calendar} role="dialog" aria-label={`Move ${taskTitle} to another day`} onKeyDown={event => { if (event.key === 'Escape') setOpen(false) }}>
          <div className={styles.calendarHeader}>
            <button type="button" className={styles.navButton} aria-label="Previous month" onClick={() => setMonth(value => shiftMonth(value, -1))}>‹</button>
            <strong aria-live="polite">{firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong>
            <button type="button" className={styles.navButton} aria-label="Next month" onClick={() => setMonth(value => shiftMonth(value, 1))}>›</button>
          </div>
          <div className={styles.calendarGrid} aria-hidden="true">
            {WEEKDAYS.map((day, index) => <span key={`${day}-${index}`} className={styles.weekday}>{day}</span>)}
          </div>
          <div className={styles.calendarGrid}>
            {days.map(day => {
              const date = toDateKey(day)
              const isCurrentMonth = day.getMonth() === monthNumber - 1
              const isSelected = date === currentDate
              return (
                <button
                  type="button"
                  key={date}
                  className={`${styles.day} ${!isCurrentMonth ? styles.outsideMonth : ''} ${isSelected ? styles.selectedDay : ''}`}
                  disabled={saving}
                  aria-label={day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  aria-current={isSelected ? 'date' : undefined}
                  onClick={() => void chooseDate(date)}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>
          {error && <div role="alert" className={styles.error}>{error}</div>}
          <div className={styles.calendarFooter}>
            <button type="button" className={styles.todayButton} disabled={saving} onClick={() => void chooseDate(toDateKey(new Date()))}>Today</button>
            <button type="button" className={styles.cancelButton} disabled={saving} onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
