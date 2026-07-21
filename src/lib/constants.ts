// Shared color constants used across Daily, Weekly, and Monthly task views

export type PriorityKey = 'low' | 'medium' | 'high' | 'urgent'
export type CategoryKey = 'work' | 'study' | 'health' | 'personal' | 'home'

export const PRIORITY_CYCLE: Record<PriorityKey, PriorityKey | null> = {
  low: 'medium', medium: 'high', high: 'urgent', urgent: null,
}

// Clear green → yellow → orange → red gradient — each step is a different hue family
export const PRIORITY_COLOR: Record<PriorityKey, string> = {
  low:    '#4ab870',  // emerald green
  medium: '#e8c040',  // clear yellow
  high:   '#e87028',  // orange
  urgent: '#e83848',  // red
}

export const CATEGORY_KEYS: CategoryKey[] = ['work', 'study', 'health', 'personal', 'home']

// Five hues evenly spread across the color wheel — always visually distinct
export const CATEGORY_COLOR: Record<CategoryKey, string> = {
  work:     '#5b8ce8',  // steel blue
  study:    '#9b60e8',  // violet
  health:   '#3db870',  // emerald green
  personal: '#e8833a',  // warm orange
  home:     '#e85079',  // rose
}

export const CATEGORIES: { key: CategoryKey; label: string; color: string }[] = [
  { key: 'work',     label: 'Work',     color: CATEGORY_COLOR.work },
  { key: 'study',    label: 'Study',    color: CATEGORY_COLOR.study },
  { key: 'health',   label: 'Health',   color: CATEGORY_COLOR.health },
  { key: 'personal', label: 'Personal', color: CATEGORY_COLOR.personal },
  { key: 'home',     label: 'Home',     color: CATEGORY_COLOR.home },
]
