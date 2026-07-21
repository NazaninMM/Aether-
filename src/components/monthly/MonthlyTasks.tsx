'use client'
import { useState, useEffect, useRef } from 'react'
import { getMonthlyTasks, addMonthlyTask, updateMonthlyTask, deleteMonthlyTask } from '@/lib/db'
import type { MonthlyTask } from '@/lib/types'
import { CATEGORIES } from '@/lib/constants'

type Category = MonthlyTask['category']

function TaskRow({ task, onToggle, onRename, onDelete }: {
  task: MonthlyTask
  onToggle: () => void
  onRename: (title: string) => void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { setTitle(task.title) }, [task.title])
  useEffect(() => { if (editing) ref.current?.focus() }, [editing])

  function save() {
    setEditing(false)
    const t = title.trim() || task.title
    if (t !== task.title) onRename(t)
  }

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 0', borderBottom: '1px solid var(--border)' }}
      onMouseEnter={e => (e.currentTarget.querySelector('.del-btn') as HTMLElement | null)?.style.setProperty('opacity', '1')}
      onMouseLeave={e => (e.currentTarget.querySelector('.del-btn') as HTMLElement | null)?.style.setProperty('opacity', '0')}
    >
      <button
        onClick={onToggle}
        style={{
          width: 15, height: 15, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
          border: `2px solid ${task.completed ? 'var(--green)' : 'var(--border-light)'}`,
          background: task.completed ? 'var(--green)' : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 0, transition: 'all 0.15s',
        }}
      >
        {task.completed && <span style={{ color: 'white', fontSize: 7, lineHeight: 1 }}>✓</span>}
      </button>

      {editing ? (
        <input
          ref={ref}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={save}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setTitle(task.title); setEditing(false) } }}
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 12, fontFamily: 'inherit' }}
        />
      ) : (
        <span
          onClick={() => setEditing(true)}
          style={{ flex: 1, fontSize: 12, cursor: 'text', lineHeight: 1.4, color: task.completed ? 'var(--text-dim)' : 'var(--text)', textDecoration: task.completed ? 'line-through' : 'none' }}
        >
          {task.title}
        </span>
      )}

      <button
        className="del-btn"
        onClick={onDelete}
        style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 13, padding: '0 2px', opacity: 0, transition: 'opacity 0.15s', flexShrink: 0 }}
      >×</button>
    </div>
  )
}

function CategoryColumn({ category, tasks, monthStart, onRefresh }: {
  category: typeof CATEGORIES[number]
  tasks: MonthlyTask[]
  monthStart: string
  onRefresh: () => void
}) {
  const [adding, setAdding] = useState(false)
  const [input, setInput] = useState('')

  async function handleAdd() {
    const t = input.trim()
    if (!t) { setAdding(false); return }
    await addMonthlyTask(monthStart, t, category.key)
    onRefresh()
    setInput('')
    setAdding(false)
  }

  const done = tasks.filter(t => t.completed).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, paddingBottom: 7, borderBottom: `2px solid ${category.color}50` }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: category.color, flexShrink: 0 }} />
        <span style={{ fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: category.color }}>{category.label}</span>
        {tasks.length > 0 && <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-dim)' }}>{done}/{tasks.length}</span>}
      </div>

      <div style={{ flex: 1 }}>
        {tasks.map(task => (
          <TaskRow
            key={task.id}
            task={task}
            onToggle={async () => { await updateMonthlyTask(task.id, { completed: !task.completed }); onRefresh() }}
            onRename={async title => { await updateMonthlyTask(task.id, { title }); onRefresh() }}
            onDelete={async () => { await deleteMonthlyTask(task.id); onRefresh() }}
          />
        ))}
      </div>

      {adding ? (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <input
            autoFocus
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false) }}
            placeholder="Task…"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 5, padding: '5px 8px', color: 'var(--text)', fontSize: 12, outline: 'none' }}
          />
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={handleAdd} style={{ flex: 1, background: category.color, border: 'none', borderRadius: 5, color: '#fff', padding: '4px', fontSize: 11, cursor: 'pointer', opacity: 0.9 }}>Add</button>
            <button onClick={() => { setAdding(false); setInput('') }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 5, color: 'var(--text-dim)', padding: '4px 8px', fontSize: 11, cursor: 'pointer' }}>✕</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{ marginTop: 8, background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 11, textAlign: 'left', padding: '3px 0', display: 'flex', alignItems: 'center', gap: 4, transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = category.color)}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
        >
          <span style={{ fontSize: 14, lineHeight: 1 }}>+</span> add task
        </button>
      )}
    </div>
  )
}

export default function MonthlyTasks({ monthStart }: { monthStart: string }) {
  const [tasks, setTasks] = useState<MonthlyTask[]>([])

  function refresh() { getMonthlyTasks(monthStart).then(setTasks) }
  useEffect(() => { refresh() }, [monthStart])

  const total = tasks.length
  const done = tasks.filter(t => t.completed).length

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="card-title" style={{ margin: 0 }}>✦ Monthly Tasks</div>
        {total > 0 && <div style={{ fontSize: 11, color: 'var(--amber)' }}>{done}/{total} done</div>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
        {CATEGORIES.map(cat => (
          <CategoryColumn
            key={cat.key}
            category={cat}
            tasks={tasks.filter(t => t.category === cat.key)}
            monthStart={monthStart}
            onRefresh={refresh}
          />
        ))}
      </div>
    </div>
  )
}
