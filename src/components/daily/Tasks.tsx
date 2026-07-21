'use client'
import { useState, useEffect, useRef } from 'react'
import { getTasks, addTask, updateTask, deleteTask } from '@/lib/db'
import type { Task } from '@/lib/types'
import { PRIORITY_CYCLE, PRIORITY_COLOR, CATEGORY_KEYS, CATEGORY_COLOR } from '@/lib/constants'

type Priority = Task['priority']
type Category = Task['category']

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
      style={{ fontSize: 11, color: value ? 'var(--text-mid)' : 'var(--text-dim)', cursor: 'text', padding: '2px 3px' }}
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
      style={{ fontSize: 11, color: local ? 'var(--text-mid)' : 'var(--text-dim)', cursor: 'text', padding: '2px 3px' }}
    >
      {icon && <span style={{ opacity: 0.6, marginRight: 2 }}>{icon}</span>}
      {local || placeholder}
    </span>
  )
}

function TaskRow({ task, onChange, onDelete }: {
  task: Task; onChange: (t: Task) => void; onDelete: () => void
}) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [title, setTitle] = useState(task.title)
  const titleRef = useRef<HTMLInputElement>(null)
  useEffect(() => { if (editingTitle) titleRef.current?.focus() }, [editingTitle])

  function saveTitle() {
    setEditingTitle(false)
    const t = title.trim() || task.title
    if (t !== task.title) {
      onChange({ ...task, title: t })
      updateTask(task.id, { title: t })
    }
  }

  function saveField(field: 'time_start' | 'time_end' | 'estimated_time' | 'actual_time', value: string) {
    const val = (value || null) as string | null
    onChange({ ...task, [field]: val })
    updateTask(task.id, { [field]: val })
  }

  function cyclePriority() {
    const next: Priority = task.priority ? PRIORITY_CYCLE[task.priority] : 'low'
    onChange({ ...task, priority: next })
    updateTask(task.id, { priority: next })
  }

  function cycleCategory() {
    const idx = task.category ? CATEGORY_KEYS.indexOf(task.category) : -1
    const next: Category = idx < CATEGORY_KEYS.length - 1 ? CATEGORY_KEYS[idx + 1] : null
    onChange({ ...task, category: next })
    updateTask(task.id, { category: next })
  }

  function toggleComplete() {
    const completed = !task.completed
    onChange({ ...task, completed })
    updateTask(task.id, { completed })
  }

  const pri = task.priority
  const cat = task.category

  return (
    <div style={{
      padding: '10px 0 10px 8px',
      borderBottom: '1px solid var(--border)',
      borderLeft: `2px solid ${pri ? PRIORITY_COLOR[pri] : 'transparent'}`,
      transition: 'border-left-color 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={toggleComplete}
          style={{
            width: 18, height: 18, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
            border: `2px solid ${task.completed ? 'var(--green)' : 'var(--border-light)'}`,
            background: task.completed ? 'var(--green)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0, transition: 'all 0.15s',
          }}
        >
          {task.completed && <span style={{ color: 'white', fontSize: 9, lineHeight: 1 }}>✓</span>}
        </button>

        {editingTitle ? (
          <input
            ref={titleRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={e => {
              if (e.key === 'Enter') saveTitle()
              if (e.key === 'Escape') { setTitle(task.title); setEditingTitle(false) }
            }}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text)', fontSize: 13, fontFamily: 'inherit',
            }}
          />
        ) : (
          <span
            onClick={() => setEditingTitle(true)}
            style={{
              flex: 1, fontSize: 13, cursor: 'text',
              textDecoration: task.completed ? 'line-through' : 'none',
              color: task.completed ? 'var(--text-dim)' : 'var(--text)',
            }}
          >
            {task.title}
          </span>
        )}

        {/* Category badge */}
        <span
          onClick={cycleCategory}
          title="Click to change type"
          style={{
            fontSize: 9, padding: '2px 7px', borderRadius: 10, cursor: 'pointer',
            flexShrink: 0, letterSpacing: 0.4, transition: 'all 0.15s',
            background: cat ? `${CATEGORY_COLOR[cat]}22` : 'var(--surface-2)',
            color: cat ? CATEGORY_COLOR[cat] : 'var(--text-dim)',
          }}
        >
          {cat ?? '—'}
        </span>

        {/* Priority badge */}
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
          style={{
            background: 'none', border: 'none', color: 'var(--text-dim)',
            cursor: 'pointer', fontSize: 15, padding: '0 2px', flexShrink: 0,
            opacity: 0.35, transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.35')}
        >
          ×
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 5, marginLeft: 28, flexWrap: 'wrap' }}>
        <TimeField value={task.time_start ?? ''} placeholder="start" onChange={v => saveField('time_start', v)} />
        <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>→</span>
        <TimeField value={task.time_end ?? ''} placeholder="end" onChange={v => saveField('time_end', v)} />
        <span style={{ color: 'var(--border-light)', fontSize: 11, margin: '0 4px' }}>·</span>
        <TextField value={task.estimated_time ?? ''} placeholder="est." icon="~" onChange={v => saveField('estimated_time', v)} />
        <span style={{ color: 'var(--border-light)', fontSize: 11, margin: '0 4px' }}>·</span>
        <TextField value={task.actual_time ?? ''} placeholder="took" icon="⏱" onChange={v => saveField('actual_time', v)} />
      </div>
    </div>
  )
}

export default function Tasks({ date }: { date: string }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [input, setInput] = useState('')
  const [adding, setAdding] = useState(false)
  const [newCategory, setNewCategory] = useState<Category>(null)

  useEffect(() => { getTasks(date).then(setTasks) }, [date])

  async function handleAdd() {
    const title = input.trim()
    if (!title) { setAdding(false); return }
    const { data } = await addTask(date, title, newCategory ?? undefined) as any
    if (data) setTasks(t => [...t, data])
    else getTasks(date).then(setTasks)
    setInput('')
    setNewCategory(null)
    setAdding(false)
  }

  async function handleDelete(id: string) {
    await deleteTask(id)
    setTasks(ts => ts.filter(t => t.id !== id))
  }

  const done = tasks.filter(t => t.completed).length

  return (
    <div className="card" style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div className="card-title" style={{ margin: 0 }}>✦ Tasks</div>
        <div style={{ fontSize: 11, color: 'var(--amber)' }}>{done}/{tasks.length}</div>
      </div>

      {tasks.map(task => (
        <TaskRow
          key={task.id}
          task={task}
          onChange={updated => setTasks(ts => ts.map(t => t.id === updated.id ? updated : t))}
          onDelete={() => handleDelete(task.id)}
        />
      ))}

      {adding ? (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              autoFocus
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false) }}
              placeholder="Task title…"
              style={{
                flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 6, padding: '6px 10px', color: 'var(--text)',
                fontSize: 13, outline: 'none',
              }}
            />
            <select
              value={newCategory ?? ''}
              onChange={e => setNewCategory((e.target.value as Category) || null)}
              style={{
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 6, padding: '6px 10px', outline: 'none', cursor: 'pointer',
                color: newCategory ? CATEGORY_COLOR[newCategory] : 'var(--text-dim)',
                fontSize: 12, flexShrink: 0,
              }}
            >
              <option value="">type…</option>
              {CATEGORY_KEYS.map(k => (
                <option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleAdd} style={{ flex: 1, background: 'var(--gold)', border: 'none', borderRadius: 6, color: '#fff', padding: '6px', fontSize: 12, cursor: 'pointer' }}>Add</button>
            <button onClick={() => { setAdding(false); setInput(''); setNewCategory(null) }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-dim)', padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="add-btn" onClick={() => setAdding(true)}>+ add task</button>
      )}
    </div>
  )
}
