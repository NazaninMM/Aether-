export interface DailyGoal {
  id: string
  date: string
  title: string
}

export interface Task {
  id: string
  date: string
  title: string
  completed: boolean
  sort_order: number
  created_at: string
  time_start: string | null
  time_end: string | null
  estimated_time: string | null
  actual_time: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent' | null
  category: 'work' | 'study' | 'health' | 'personal' | 'home' | null
}

export interface Event {
  id: string
  date: string
  title: string
  time_label: string | null
  time_start: string | null
  time_end: string | null
  location: string | null
  sort_order: number
}

export interface TimeBlock {
  id: string
  date: string
  time_label: string | null
  time_start: string | null
  time_end: string | null
  title: string
  subtitle: string | null
  is_event: boolean
  sort_order: number
  estimated_time: string | null
  actual_time: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent' | null
}

export interface DailyNote {
  id: string
  date: string
  content: string
  mood: 1 | 2 | 3
  energy: 1 | 2 | 3 | 4 | 5
}

export interface Routine {
  id: string
  name: string
  days: number[] | null   // null = every day; [0..6] = specific weekdays (0=Sun)
  sort_order: number
}

export interface RoutineLog {
  id: string
  routine_id: string
  date: string
  completed: boolean
}

export interface WeeklyGoal {
  id: string
  week_start: string
  title: string
  next_week_focus: string
  reflection: string
}

export interface WeeklyTask {
  id: string
  week_start: string
  title: string
  category: 'work' | 'study' | 'health' | 'personal' | 'home'
  completed: boolean
  sort_order: number
  created_at: string
}

export interface WeeklyGoalItem {
  id: string
  week_start: string
  title: string
  category: 'work' | 'study' | 'health' | 'personal' | 'home'
  completed: boolean
  sort_order: number
  created_at: string
}

export interface WeeklyWin {
  id: string
  week_start: string
  content: string
  day_label: string | null
  sort_order: number
}

export interface MonthlyGoal {
  id: string
  month_start: string
  title: string
  updated_at: string
}

export interface MonthlyTask {
  id: string
  month_start: string
  title: string
  category: 'work' | 'study' | 'health' | 'personal' | 'home'
  completed: boolean
  sort_order: number
  created_at: string
}
