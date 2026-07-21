'use client'
import { useState, useEffect, useRef } from 'react'
import { getEvents, addEvent, updateEvent, deleteEvent } from '@/lib/db'
import type { Event } from '@/lib/types'

function fmt24to12(t: string) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

function calcDuration(start: string, end: string): string {
  if (!start || !end) return ''
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const totalMin = (eh * 60 + em) - (sh * 60 + sm)
  if (totalMin <= 0) return ''
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function TimeField({ value, placeholder, onChange }: {
  value: string; placeholder: string; onChange: (v: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { if (editing) ref.current?.focus() }, [editing])

  if (editing) {
    return (
      <input
        ref={ref}
        type="time"
        defaultValue={value}
        onBlur={e => { setEditing(false); onChange(e.target.value) }}
        style={{
          width: 105, background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 5, color: 'var(--text-mid)', fontSize: 11,
          padding: '2px 5px', outline: 'none', fontFamily: 'inherit',
        }}
      />
    )
  }
  return (
    <span
      onClick={() => setEditing(true)}
      style={{ fontSize: 11, color: value ? 'var(--text-mid)' : 'var(--text-dim)', cursor: 'text', padding: '2px 3px' }}
    >
      {value ? fmt24to12(value) : placeholder}
    </span>
  )
}

function EventRow({ event, onChange, onDelete }: {
  event: Event; onChange: (e: Event) => void; onDelete: () => void
}) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [title, setTitle] = useState(event.title)
  const titleRef = useRef<HTMLInputElement>(null)
  useEffect(() => { if (editingTitle) titleRef.current?.focus() }, [editingTitle])

  function saveTitle() {
    setEditingTitle(false)
    const t = title.trim() || event.title
    if (t !== event.title) {
      onChange({ ...event, title: t })
      updateEvent(event.id, { title: t })
    }
  }

  function saveTime(field: 'time_start' | 'time_end', value: string) {
    const val = value || null
    onChange({ ...event, [field]: val })
    updateEvent(event.id, { [field]: val })
  }

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 3, background: 'var(--event-color)', borderRadius: 2, minHeight: 36, flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1 }}>
        {editingTitle ? (
          <input
            ref={titleRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={e => {
              if (e.key === 'Enter') saveTitle()
              if (e.key === 'Escape') { setTitle(event.title); setEditingTitle(false) }
            }}
            style={{
              width: '100%', background: 'none', border: 'none', outline: 'none',
              color: 'var(--text)', fontSize: 12, fontFamily: 'inherit',
            }}
          />
        ) : (
          <div
            onClick={() => setEditingTitle(true)}
            style={{ fontSize: 12, color: 'var(--text)', cursor: 'text' }}
          >
            {event.title}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 3 }}>
          <TimeField value={event.time_start ?? ''} placeholder="start" onChange={v => saveTime('time_start', v)} />
          <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>→</span>
          <TimeField value={event.time_end ?? ''} placeholder="end" onChange={v => saveTime('time_end', v)} />
          {!event.time_start && !event.time_end && event.time_label && (
            <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{event.time_label}</span>
          )}
          {(() => {
            const dur = calcDuration(event.time_start ?? '', event.time_end ?? '')
            return dur ? (
              <span style={{ fontSize: 10, color: 'var(--text-dim)', marginLeft: 4 }}>· {dur}</span>
            ) : null
          })()}
        </div>
      </div>
      <button
        onClick={onDelete}
        style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 14, padding: '0 2px', opacity: 0.35, transition: 'opacity 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0.35')}
      >×</button>
    </div>
  )
}

export default function Events({ date }: { date: string }) {
  const [events, setEvents] = useState<Event[]>([])
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [timeStart, setTimeStart] = useState('')
  const [timeEnd, setTimeEnd] = useState('')

  useEffect(() => { getEvents(date).then(setEvents) }, [date])

  async function handleAdd() {
    const t = title.trim()
    if (!t) { setAdding(false); return }
    await addEvent(date, t, timeStart || undefined, timeEnd || undefined)
    getEvents(date).then(setEvents)
    setTitle(''); setTimeStart(''); setTimeEnd(''); setAdding(false)
  }

  async function handleDelete(id: string) {
    await deleteEvent(id)
    setEvents(es => es.filter(e => e.id !== id))
  }

  return (
    <div className="card" style={{ flex: 1 }}>
      <div className="card-title">✦ Events & Reminders</div>

      {events.length === 0 && (
        <div style={{ fontSize: 11, color: 'var(--text-dim)', fontStyle: 'italic', padding: '4px 0' }}>No events today</div>
      )}

      {events.map(ev => (
        <EventRow
          key={ev.id}
          event={ev}
          onChange={updated => setEvents(es => es.map(e => e.id === updated.id ? updated : e))}
          onDelete={() => handleDelete(ev.id)}
        />
      ))}

      {adding ? (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false) }}
            placeholder="Event title…"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', color: 'var(--text)', fontSize: 13, outline: 'none' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="time"
              value={timeStart}
              onChange={e => setTimeStart(e.target.value)}
              style={{ flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', color: 'var(--text)', fontSize: 13, outline: 'none' }}
            />
            <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>→</span>
            <input
              type="time"
              value={timeEnd}
              onChange={e => setTimeEnd(e.target.value)}
              style={{ flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', color: 'var(--text)', fontSize: 13, outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleAdd} style={{ flex: 1, background: 'var(--gold)', border: 'none', borderRadius: 6, color: '#fff', padding: '6px', fontSize: 12, cursor: 'pointer' }}>Add</button>
            <button onClick={() => setAdding(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-dim)', padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="add-btn" onClick={() => setAdding(true)}>+ add event</button>
      )}
    </div>
  )
}
