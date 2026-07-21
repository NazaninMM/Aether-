'use client'
import React, { useState, useEffect, useRef } from 'react'
import { getTimeBlocks, addTimeBlock, updateTimeBlock, deleteTimeBlock } from '@/lib/db'
import type { TimeBlock } from '@/lib/types'

type Priority = TimeBlock['priority']

const PRIORITY_CYCLE: Record<string, Priority> = {
  low: 'medium', medium: 'high', high: 'urgent', urgent: null,
}
const PRIORITY_COLOR: Record<string, string> = {
  low: 'var(--green)', medium: 'var(--amber)', high: '#d4703a', urgent: '#c04040',
}

function fmt24to12(t: string) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
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
      style={{ fontSize: 11, color: 'var(--text-dim)', cursor: 'text', padding: '2px 3px' }}
    >
      {value ? fmt24to12(value) : placeholder}
    </span>
  )
}

function TextField({ value, placeholder, icon, onChange }: {
  value: string; placeholder: string; icon?: string; onChange: (v: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState(value)
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { setLocal(value) }, [value])
  useEffect(() => { if (editing) ref.current?.focus() }, [editing])

  function save() {
    setEditing(false)
    if (local !== value) onChange(local)
  }

  if (editing) {
    return (
      <input
        ref={ref}
        value={local}
        onChange={e => setLocal(e.target.value)}
        onBlur={save}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setLocal(value); setEditing(false) } }}
        placeholder={placeholder}
        style={{
          width: 72, background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 5, color: 'var(--text-mid)', fontSize: 11,
          padding: '2px 5px', outline: 'none', fontFamily: 'inherit',
        }}
      />
    )
  }
  return (
    <span
      onClick={() => setEditing(true)}
      style={{ fontSize: 11, color: 'var(--text-dim)', cursor: 'text', padding: '2px 3px' }}
    >
      {icon && <span style={{ opacity: 0.6, marginRight: 2 }}>{icon}</span>}
      {local || placeholder}
    </span>
  )
}

function InlineText({ value, fontSize, color, placeholder, onSave, style }: {
  value: string; fontSize: number; color: string; placeholder: string
  onSave: (v: string) => void; style?: React.CSSProperties
}) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState(value)
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { setLocal(value) }, [value])
  useEffect(() => { if (editing) ref.current?.focus() }, [editing])

  function save() {
    setEditing(false)
    const v = local.trim() || value
    if (v !== value) onSave(v)
  }

  if (editing) {
    return (
      <input
        ref={ref}
        value={local}
        onChange={e => setLocal(e.target.value)}
        onBlur={save}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setLocal(value); setEditing(false) } }}
        style={{ background: 'none', border: 'none', outline: 'none', width: '100%', fontSize, color, fontFamily: 'inherit', ...style }}
      />
    )
  }
  return (
    <div
      onClick={() => setEditing(true)}
      style={{ fontSize, color, cursor: 'text', ...style }}
    >
      {value || <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>{placeholder}</span>}
    </div>
  )
}

function TimeBlockRow({ block, onChange, onDelete }: {
  block: TimeBlock; onChange: (b: TimeBlock) => void; onDelete: () => void
}) {
  function save(fields: Partial<TimeBlock>) {
    const updated = { ...block, ...fields }
    onChange(updated)
    updateTimeBlock(block.id, fields)
  }

  function saveField(field: 'time_start' | 'time_end' | 'estimated_time' | 'actual_time', value: string) {
    const val = value || null
    onChange({ ...block, [field]: val })
    updateTimeBlock(block.id, { [field]: val })
  }

  function cyclePriority() {
    const next: Priority = block.priority ? PRIORITY_CYCLE[block.priority] : 'low'
    save({ priority: next })
  }

  const pri = block.priority

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
      {/* Time column */}
      <div style={{ fontFamily: 'Georgia, serif', color: 'var(--gold)', width: 88, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', gap: 2, paddingRight: 0 }}>
        {block.time_start ? (
          <>
            <span style={{ fontSize: 16, lineHeight: 1.3 }}>{fmt24to12(block.time_start)}</span>
            <span style={{ fontSize: 16, lineHeight: 1.3 }}>{block.time_end ? fmt24to12(block.time_end) : '—'}</span>
          </>
        ) : (
          <span style={{ fontSize: 13 }}>{block.time_label ?? ''}</span>
        )}
      </div>
      {/* Card */}
      <div style={{
        flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderLeft: `2px solid ${block.is_event ? 'var(--event-color)' : 'var(--gold-dim)'}`,
        borderRadius: '0 7px 7px 0', padding: '8px 12px',
        margin: '5px 0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <InlineText
              value={block.title}
              fontSize={15}
              color="var(--text)"
              placeholder="Block title…"
              onSave={v => save({ title: v })}
            />
            <InlineText
              value={block.subtitle ?? ''}
              fontSize={12}
              color="var(--text-mid)"
              placeholder="note…"
              onSave={v => save({ subtitle: v || null })}
              style={{ marginTop: 3, fontStyle: 'italic' }}
            />
          </div>

          <button
            onClick={cyclePriority}
            title="Click to cycle priority"
            style={{
              border: 'none', cursor: 'pointer', padding: '2px 8px', borderRadius: 10,
              fontSize: 10, fontWeight: 600, letterSpacing: 0.4, flexShrink: 0,
              background: pri ? `${PRIORITY_COLOR[pri]}22` : 'var(--surface-2)',
              color: pri ? PRIORITY_COLOR[pri] : 'var(--text-dim)',
              transition: 'all 0.15s',
            }}
          >
            {pri ?? '—'}
          </button>

          <button
            onClick={onDelete}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 14, padding: 0, opacity: 0.35, transition: 'opacity 0.15s', flexShrink: 0 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.35')}
          >×</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 6, flexWrap: 'wrap' }}>
          <TimeField value={block.time_start ?? ''} placeholder="start" onChange={v => saveField('time_start', v)} />
          <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>→</span>
          <TimeField value={block.time_end ?? ''} placeholder="end" onChange={v => saveField('time_end', v)} />
          <span style={{ color: 'var(--border-light)', fontSize: 11, margin: '0 4px' }}>·</span>
          <TextField value={block.estimated_time ?? ''} placeholder="est." icon="~" onChange={v => saveField('estimated_time', v)} />
          <span style={{ color: 'var(--border-light)', fontSize: 11, margin: '0 4px' }}>·</span>
          <TextField value={block.actual_time ?? ''} placeholder="took" icon="⏱" onChange={v => saveField('actual_time', v)} />
        </div>
      </div>
    </div>
  )
}

export default function TimeBlocks({ date }: { date: string }) {
  const [blocks, setBlocks] = useState<TimeBlock[]>([])
  const [adding, setAdding] = useState(false)
  const [timeStart, setTimeStart] = useState('')
  const [timeEnd, setTimeEnd] = useState('')
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [isEvent, setIsEvent] = useState(false)

  useEffect(() => { getTimeBlocks(date).then(setBlocks) }, [date])

  async function handleAdd() {
    if (!title.trim()) { setAdding(false); return }
    const { data } = await addTimeBlock(date, title.trim(), timeStart || undefined, timeEnd || undefined, subtitle.trim() || undefined, isEvent) as any
    if (data) setBlocks(bs => [...bs, data])
    else getTimeBlocks(date).then(setBlocks)
    setTimeStart(''); setTimeEnd(''); setTitle(''); setSubtitle(''); setIsEvent(false); setAdding(false)
  }

  async function handleDelete(id: string) {
    await deleteTimeBlock(id)
    setBlocks(bs => bs.filter(b => b.id !== id))
  }

  return (
    <div className="card">
      <div className="card-title">✦ Schedule — Time Blocks</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {blocks.map(b => (
          <TimeBlockRow
            key={b.id}
            block={b}
            onChange={updated => setBlocks(bs => bs.map(x => x.id === updated.id ? updated : x))}
            onDelete={() => handleDelete(b.id)}
          />
        ))}
      </div>

      {adding ? (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') setAdding(false) }}
            placeholder="Block title…"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', color: 'var(--text)', fontSize: 13, outline: 'none' }}
          />
          <input
            value={subtitle}
            onChange={e => setSubtitle(e.target.value)}
            placeholder="Subtitle / note (optional)"
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-dim)', cursor: 'pointer' }}>
              <input type="checkbox" checked={isEvent} onChange={e => setIsEvent(e.target.checked)} />
              Mark as event
            </label>
            <div style={{ flex: 1 }} />
            <button onClick={handleAdd} style={{ background: 'var(--gold)', border: 'none', borderRadius: 6, color: '#fff', padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}>Add</button>
            <button onClick={() => setAdding(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-dim)', padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="add-btn" onClick={() => setAdding(true)}>+ add time block</button>
      )}
    </div>
  )
}
