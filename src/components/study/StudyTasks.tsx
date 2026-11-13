'use client'
import { useEffect, useMemo, useState } from 'react'
import {
  addStudyCourse, addStudyTask, deleteStudyCourse, deleteStudyTask,
  getStudyCourses, getStudyTasks, updateStudyCourse, updateStudyTask,
} from '@/lib/db'
import { PRIORITY_COLOR, type PriorityKey } from '@/lib/constants'
import type { StudyCourse, StudyTask } from '@/lib/types'
import StudyCourseSelect from './StudyCourseSelect'
import styles from './StudyTasks.module.css'

const PRIORITIES: Array<PriorityKey | ''> = ['', 'low', 'medium', 'high', 'urgent']
const priorityRank: Record<PriorityKey, number> = { urgent: 4, high: 3, medium: 2, low: 1 }
const rank = (priority: PriorityKey | null) => priority ? priorityRank[priority] : 0

function sortTasks(tasks: StudyTask[]) {
  return [...tasks].sort((a, b) => {
    if (a.deadline && b.deadline) {
      const byDate = a.deadline.localeCompare(b.deadline)
      if (byDate) return byDate
      const byPriority = rank(b.priority) - rank(a.priority)
      if (byPriority) return byPriority
    } else if (a.deadline || b.deadline) {
      return a.deadline ? -1 : 1
    } else {
      const byPriority = rank(b.priority) - rank(a.priority)
      if (byPriority) return byPriority
    }
    return a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at)
  })
}

export default function StudyTasks() {
  const [tasks, setTasks] = useState<StudyTask[]>([])
  const [courses, setCourses] = useState<StudyCourse[]>([])
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState('')
  const [priority, setPriority] = useState<PriorityKey | ''>('')
  const [courseId, setCourseId] = useState('')
  const [newCourseName, setNewCourseName] = useState('')
  const [newCourseColor, setNewCourseColor] = useState('#9b60e8')
  const [managingCourses, setManagingCourses] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refresh() {
    setError('')
    try {
      const [nextTasks, nextCourses] = await Promise.all([getStudyTasks(), getStudyCourses()])
      setTasks(nextTasks)
      setCourses(nextCourses)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load study tasks.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    Promise.all([getStudyTasks(), getStudyCourses()]).then(([nextTasks, nextCourses]) => {
      if (!active) return
      setTasks(nextTasks)
      setCourses(nextCourses)
    }).catch(reason => {
      if (active) setError(reason instanceof Error ? reason.message : 'Could not load study tasks.')
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [])

  const sortedTasks = useMemo(() => sortTasks(tasks), [tasks])

  async function addTask() {
    const trimmed = title.trim()
    if (!trimmed) return
    const { error: saveError } = await addStudyTask(trimmed, deadline || null, priority || null, courseId || null)
    if (saveError) { setError('Could not add the study task. Please try again.'); return }
    setTitle('')
    setDeadline('')
    setPriority('')
    setCourseId('')
    await refresh()
  }

  async function saveTask(task: StudyTask, fields: Partial<Pick<StudyTask, 'title' | 'deadline' | 'priority' | 'course_id' | 'completed'>>) {
    const { error: saveError } = await updateStudyTask(task.id, fields)
    if (saveError) { setError('Could not save this study task. Please try again.'); return }
    await refresh()
  }

  async function addCourse() {
    const name = newCourseName.trim()
    if (!name) return
    const { error: saveError } = await addStudyCourse(name, newCourseColor)
    if (saveError) { setError('Could not add this course. Check that its name is unique.'); return }
    setNewCourseName('')
    await refresh()
  }

  async function saveCourse(course: StudyCourse, name: string, color: string) {
    const trimmed = name.trim()
    if (!trimmed) { setError('Course names cannot be empty.'); return }
    const { error: saveError } = await updateStudyCourse(course.id, { name: trimmed, color })
    if (saveError) { setError('Could not update this course. Course names must be unique.'); return }
    await refresh()
  }

  async function removeCourse(course: StudyCourse) {
    const { error: saveError } = await deleteStudyCourse(course.id)
    if (saveError) { setError('Could not delete this course. Please try again.'); return }
    await refresh()
  }

  async function removeTask(task: StudyTask) {
    const { error: saveError } = await deleteStudyTask(task.id)
    if (saveError) { setError('Could not delete this task. Please try again.'); return }
    await refresh()
  }

  const completed = tasks.filter(task => task.completed).length

  return (
    <main id="study-world" className={styles.page} aria-label="Study" tabIndex={-1}>
      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}>Your learning orbit</div>
          <h1 className={styles.title}>Study tasks</h1>
          <p className={styles.intro}>One shared list for coursework, quizzes, and everything you are learning.</p>
        </div>
        <div className={styles.count}><strong>{completed}/{tasks.length}</strong> complete</div>
      </header>

      <section className={styles.panel} aria-label="Study task list">
        <div className={styles.toolbar}>
          <div className={styles.toolbarTitle}>To-do list</div>
          <button type="button" className={styles.secondaryButton} onClick={() => setManagingCourses(value => !value)}>
            {managingCourses ? 'Close courses' : 'Manage courses'}
          </button>
        </div>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        {loading ? <div role="status" className={styles.loading}>Loading study tasks...</div> : (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr><th>Done</th><th className={styles.taskName}>Task</th><th>Due date</th><th>Priority</th><th>Course</th><th aria-label="Actions" /></tr>
                </thead>
                <tbody>
                  {sortedTasks.map(task => (
                    <StudyTaskRow
                      key={task.id}
                      task={task}
                      courses={courses}
                      onSave={fields => saveTask(task, fields)}
                      onDelete={() => void removeTask(task)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            {sortedTasks.length === 0 && <div className={styles.empty}>No study tasks yet. Add one below to get started.</div>}
            <div className={styles.addForm}>
              <input
                className={styles.textInput}
                value={title}
                onChange={event => setTitle(event.target.value)}
                onKeyDown={event => { if (event.key === 'Enter') void addTask() }}
                placeholder="Add a study task..."
                aria-label="New study task title"
              />
              <input className={styles.dateInput} type="date" value={deadline} onChange={event => setDeadline(event.target.value)} aria-label="Due date" />
              <select
                className={styles.select}
                value={priority}
                style={{ color: priority ? PRIORITY_COLOR[priority] : 'var(--text-dim)' }}
                onChange={event => setPriority(event.target.value as PriorityKey | '')}
                aria-label="Priority"
              >
                {PRIORITIES.map(item => <option key={item || 'none'} value={item}>{item ? item[0].toUpperCase() + item.slice(1) : 'No priority'}</option>)}
              </select>
              <StudyCourseSelect value={courseId} courses={courses} onChange={setCourseId} label="Course" />
              <button type="button" className={styles.button} onClick={() => void addTask()}>Add task</button>
            </div>
          </>
        )}
      </section>

      {managingCourses && (
        <section className={styles.coursePanel} aria-label="Manage courses">
          <div className={styles.toolbarTitle}>Course tags</div>
          <div className={styles.courseForm} style={{ marginTop: 12 }}>
            <input className={styles.textInput} value={newCourseName} onChange={event => setNewCourseName(event.target.value)} placeholder="Course name" aria-label="New course name" />
            <input className={styles.colorInput} type="color" value={newCourseColor} onChange={event => setNewCourseColor(event.target.value)} aria-label="New course color" />
            <button type="button" className={styles.button} onClick={() => void addCourse()}>Add course</button>
          </div>
          <div className={styles.courseList}>
            {courses.map(course => <CourseEditor key={`${course.id}:${course.name}:${course.color}`} course={course} onSave={saveCourse} onDelete={removeCourse} />)}
            {courses.length === 0 && <div className={styles.empty}>Add course tags such as Math or Data Comms.</div>}
          </div>
        </section>
      )}
    </main>
  )
}

function StudyTaskRow({ task, courses, onSave, onDelete }: {
  task: StudyTask
  courses: StudyCourse[]
  onSave: (fields: Partial<Pick<StudyTask, 'title' | 'deadline' | 'priority' | 'course_id' | 'completed'>>) => void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const priorityColor = task.priority ? PRIORITY_COLOR[task.priority] : 'var(--text-dim)'

  return (
    <tr>
      <td><input className={styles.checkbox} type="checkbox" checked={task.completed} onChange={event => onSave({ completed: event.target.checked })} aria-label={`Mark ${task.title} ${task.completed ? 'incomplete' : 'complete'}`} /></td>
      <td className={styles.taskName}>
        {editing ? (
          <input
            autoFocus
            className={styles.titleInput}
            value={title}
            onChange={event => setTitle(event.target.value)}
            onBlur={() => { setEditing(false); if (title.trim() && title.trim() !== task.title) onSave({ title: title.trim() }) }}
            onKeyDown={event => {
              if (event.key === 'Enter') event.currentTarget.blur()
              if (event.key === 'Escape') { setTitle(task.title); setEditing(false) }
            }}
          />
        ) : (
          <span className={`${styles.taskTitle} ${task.completed ? styles.completed : ''}`} onClick={() => { setTitle(task.title); setEditing(true) }}>{task.title}</span>
        )}
      </td>
      <td><input className={styles.dateInput} type="date" value={task.deadline ?? ''} onChange={event => onSave({ deadline: event.target.value || null })} aria-label={`Due date for ${task.title}`} /></td>
      <td>
        <select
          className={styles.select}
          value={task.priority ?? ''}
          style={{ color: priorityColor }}
          onChange={event => onSave({ priority: (event.target.value || null) as StudyTask['priority'] })}
          aria-label={`Priority for ${task.title}`}
        >
          {PRIORITIES.map(item => <option key={item || 'none'} value={item}>{item ? item[0].toUpperCase() + item.slice(1) : 'No priority'}</option>)}
        </select>
      </td>
      <td><StudyCourseSelect value={task.course_id ?? ''} courses={courses} onChange={course_id => onSave({ course_id: course_id || null })} label={`Course for ${task.title}`} /></td>
      <td><button type="button" className={styles.deleteButton} onClick={onDelete} aria-label={`Delete ${task.title}`}>×</button></td>
    </tr>
  )
}

function CourseEditor({ course, onSave, onDelete }: {
  course: StudyCourse
  onSave: (course: StudyCourse, name: string, color: string) => void
  onDelete: (course: StudyCourse) => void
}) {
  const [name, setName] = useState(course.name)
  const [color, setColor] = useState(course.color)
  return (
    <div className={styles.courseRow}>
      <input className={styles.colorInput} type="color" value={color} onChange={event => setColor(event.target.value)} aria-label={`Color for ${course.name}`} />
      <input className={styles.textInput} value={name} onChange={event => setName(event.target.value)} aria-label={`Name for ${course.name}`} />
      <button type="button" className={styles.secondaryButton} onClick={() => onSave(course, name, color)}>Save</button>
      <button type="button" className={styles.secondaryButton} onClick={() => onDelete(course)}>Delete</button>
    </div>
  )
}
