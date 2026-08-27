import { supabase } from './supabase'
import type { DailyGoal, Task, Event, TimeBlock, DailyNote, Routine, RoutineLog, WeeklyGoal, WeeklyWin, WeeklyTask, WeeklyGoalItem, MonthlyGoal, MonthlyTask } from './types'
import { repeatsOnDate } from './utils'

// ── Daily Goal ──────────────────────────────────────
export async function getDailyGoal(date: string): Promise<DailyGoal | null> {
  const { data } = await supabase.from('daily_goals').select('*').eq('date', date).maybeSingle()
  return data
}
export async function upsertDailyGoal(date: string, title: string) {
  return supabase.from('daily_goals').upsert({ date, title, updated_at: new Date().toISOString() }, { onConflict: 'date' })
}

// ── Tasks ────────────────────────────────────────────
export async function getTasks(date: string): Promise<Task[]> {
  const { data } = await supabase.from('tasks').select('*').eq('date', date).order('sort_order').order('created_at')
  return data ?? []
}
export async function addTask(date: string, title: string, category?: Task['category']) {
  return supabase.from('tasks').insert({ date, title, category }).select().single()
}
export async function updateTask(id: string, fields: Partial<Omit<Task, 'id' | 'date' | 'created_at'>>) {
  return supabase.from('tasks').update(fields).eq('id', id)
}
export async function deleteTask(id: string) {
  return supabase.from('tasks').delete().eq('id', id)
}

// ── Events ───────────────────────────────────────────
export async function getEvents(date: string): Promise<Event[]> {
  const [{ data: onDate }, { data: repeating }] = await Promise.all([
    supabase.from('events').select('*').eq('date', date).is('repeat_days', null).order('sort_order').order('created_at'),
    supabase.from('events').select('*').not('repeat_days', 'is', null).lte('date', date),
  ])
  const active = (repeating ?? []).filter(e => repeatsOnDate(e.repeat_days, date))
  return [...(onDate ?? []), ...active]
}
export async function addEvent(date: string, title: string, time_start?: string, time_end?: string, location?: string, repeat_days?: number[] | null) {
  const result = await supabase.from('events').insert({ date, title, time_start, time_end, location, repeat_days: repeat_days ?? null }).select().single()
  if (result.error) console.error('[addEvent]', result.error.message)
  return result
}
export async function updateEvent(id: string, fields: Partial<Omit<Event, 'id' | 'date' | 'sort_order'>>) {
  return supabase.from('events').update(fields).eq('id', id)
}
export async function deleteEvent(id: string) {
  return supabase.from('events').delete().eq('id', id)
}

// ── Time Blocks ───────────────────────────────────────
export async function getTimeBlocks(date: string): Promise<TimeBlock[]> {
  const [{ data: onDate }, { data: repeating }] = await Promise.all([
    supabase.from('time_blocks').select('*').eq('date', date).is('repeat_days', null).order('sort_order').order('created_at'),
    supabase.from('time_blocks').select('*').not('repeat_days', 'is', null).lte('date', date),
  ])
  const active = (repeating ?? []).filter(b => repeatsOnDate(b.repeat_days, date))
  return [...(onDate ?? []), ...active]
}
export async function addTimeBlock(date: string, title: string, time_start?: string, time_end?: string, subtitle?: string, is_event?: boolean, repeat_days?: number[] | null) {
  return supabase.from('time_blocks').insert({ date, title, time_label: '', time_start, time_end, subtitle, is_event: is_event ?? false, repeat_days: repeat_days ?? null }).select().single()
}
export async function updateTimeBlock(id: string, fields: Partial<Omit<TimeBlock, 'id' | 'date' | 'sort_order'>>) {
  return supabase.from('time_blocks').update(fields).eq('id', id)
}
export async function deleteTimeBlock(id: string) {
  return supabase.from('time_blocks').delete().eq('id', id)
}

// ── Daily Notes ───────────────────────────────────────
export async function getDailyNote(date: string): Promise<DailyNote | null> {
  const { data } = await supabase.from('daily_notes').select('*').eq('date', date).maybeSingle()
  return data
}
export async function upsertDailyNote(date: string, content: string, mood: number, energy: number) {
  return supabase.from('daily_notes').upsert({ date, content, mood, energy, updated_at: new Date().toISOString() }, { onConflict: 'date' })
}

// ── Routines ──────────────────────────────────────────
export async function getRoutines(): Promise<Routine[]> {
  const { data } = await supabase.from('routines').select('*').order('sort_order').order('created_at')
  return data ?? []
}
export async function addRoutine(name: string, days: number[] | null, color: string) {
  const result = await supabase.from('routines').insert({ name, days, color }).select().single()
  if (result.error) console.error('[addRoutine]', result.error.message)
  return result
}
export async function updateRoutine(id: string, fields: Partial<Omit<Routine, 'id' | 'sort_order'>>) {
  const result = await supabase.from('routines').update(fields).eq('id', id)
  if (result.error) console.error('[updateRoutine]', result.error.message)
  return result
}
export async function deleteRoutine(id: string) {
  return supabase.from('routines').delete().eq('id', id)
}

// ── Routine Logs ──────────────────────────────────────
export async function getRoutineLogs(dates: string[]): Promise<RoutineLog[]> {
  const { data } = await supabase.from('routine_logs').select('*').in('date', dates)
  return data ?? []
}
export async function toggleRoutineLog(routine_id: string, date: string, completed: boolean) {
  return supabase.from('routine_logs').upsert({ routine_id, date, completed }, { onConflict: 'routine_id,date' })
}

// ── Weekly Goal ───────────────────────────────────────
export async function getWeeklyGoal(week_start: string): Promise<WeeklyGoal | null> {
  const { data } = await supabase.from('weekly_goals').select('*').eq('week_start', week_start).maybeSingle()
  return data
}
export async function upsertWeeklyGoal(week_start: string, fields: Partial<WeeklyGoal>) {
  return supabase.from('weekly_goals').upsert({ week_start, ...fields, updated_at: new Date().toISOString() }, { onConflict: 'week_start' })
}

// ── Weekly Tasks ──────────────────────────────────────
export async function getWeeklyTasks(week_start: string): Promise<WeeklyTask[]> {
  const { data, error } = await supabase.from('weekly_tasks').select('*').eq('week_start', week_start).order('sort_order').order('created_at')
  if (error) console.error('[getWeeklyTasks]', error)
  return data ?? []
}
export async function addWeeklyTask(week_start: string, title: string, category: WeeklyTask['category']) {
  const result = await supabase.from('weekly_tasks').insert({ week_start, title, category }).select().single()
  if (result.error) console.error('[addWeeklyTask]', result.error)
  return result
}
export async function updateWeeklyTask(id: string, fields: Partial<Omit<WeeklyTask, 'id' | 'week_start' | 'created_at'>>) {
  return supabase.from('weekly_tasks').update(fields).eq('id', id)
}
export async function deleteWeeklyTask(id: string) {
  return supabase.from('weekly_tasks').delete().eq('id', id)
}

// ── Monthly Goal ──────────────────────────────────────
export async function getMonthlyGoal(month_start: string): Promise<MonthlyGoal | null> {
  const { data } = await supabase.from('monthly_goals').select('*').eq('month_start', month_start).maybeSingle()
  return data
}
export async function upsertMonthlyGoal(month_start: string, title: string) {
  return supabase.from('monthly_goals').upsert({ month_start, title, updated_at: new Date().toISOString() }, { onConflict: 'month_start' })
}

// ── Monthly Tasks ──────────────────────────────────────
export async function getMonthlyTasks(month_start: string): Promise<MonthlyTask[]> {
  const { data, error } = await supabase.from('monthly_tasks').select('*').eq('month_start', month_start).order('sort_order').order('created_at')
  if (error) console.error('[getMonthlyTasks]', error.message)
  return data ?? []
}
export async function addMonthlyTask(month_start: string, title: string, category: MonthlyTask['category']) {
  const result = await supabase.from('monthly_tasks').insert({ month_start, title, category }).select().single()
  if (result.error) console.error('[addMonthlyTask]', result.error.message)
  return result
}
export async function updateMonthlyTask(id: string, fields: Partial<Omit<MonthlyTask, 'id' | 'month_start' | 'created_at'>>) {
  return supabase.from('monthly_tasks').update(fields).eq('id', id)
}
export async function deleteMonthlyTask(id: string) {
  return supabase.from('monthly_tasks').delete().eq('id', id)
}

// ── Calendar range queries ─────────────────────────────
export async function getTasksInRange(startDate: string, endDate: string): Promise<Pick<Task, 'id' | 'date' | 'title' | 'completed' | 'category'>[]> {
  const { data } = await supabase.from('tasks').select('id, date, title, completed, category').gte('date', startDate).lte('date', endDate)
  return data ?? []
}
export async function getDailyNotesInRange(startDate: string, endDate: string): Promise<DailyNote[]> {
  const { data } = await supabase.from('daily_notes').select('id, date, mood, energy, content').gte('date', startDate).lte('date', endDate)
  return data ?? []
}

// ── Weekly Goal Items ─────────────────────────────────
export async function getWeeklyGoalItems(week_start: string): Promise<WeeklyGoalItem[]> {
  const { data, error } = await supabase.from('weekly_goal_items').select('*').eq('week_start', week_start).order('sort_order').order('created_at')
  if (error) console.error('[getWeeklyGoalItems]', error.message)
  return data ?? []
}
export async function addWeeklyGoalItem(week_start: string, title: string, category: WeeklyGoalItem['category']) {
  const result = await supabase.from('weekly_goal_items').insert({ week_start, title, category }).select().single()
  if (result.error) console.error('[addWeeklyGoalItem]', result.error.message)
  return result
}
export async function updateWeeklyGoalItem(id: string, fields: Partial<Omit<WeeklyGoalItem, 'id' | 'week_start' | 'created_at'>>) {
  return supabase.from('weekly_goal_items').update(fields).eq('id', id)
}
export async function deleteWeeklyGoalItem(id: string) {
  return supabase.from('weekly_goal_items').delete().eq('id', id)
}

// ── Weekly Wins ───────────────────────────────────────
export async function getWeeklyWins(week_start: string): Promise<WeeklyWin[]> {
  const { data } = await supabase.from('weekly_wins').select('*').eq('week_start', week_start).order('sort_order').order('created_at')
  return data ?? []
}
export async function addWeeklyWin(week_start: string, content: string, day_label?: string) {
  return supabase.from('weekly_wins').insert({ week_start, content, day_label })
}
export async function deleteWeeklyWin(id: string) {
  return supabase.from('weekly_wins').delete().eq('id', id)
}
