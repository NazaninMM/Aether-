

## Task deadlines

Daily, weekly, and monthly tasks support an optional deadline date. Set it when adding a task, or change or clear it in the task row. Copying a task preserves its deadline.

Before using this feature, apply `supabase/migrations/20261103000000_add_task_deadlines.sql` to the connected Supabase database using the SQL editor or your normal migration workflow. Existing tasks retain a null deadline.

## Monthly task overview

The separate All Tasks This Month list includes daily, weekly, and monthly tasks when their scheduled period overlaps the selected month or their deadline falls within it. A January task due in February appears in both months, once per month. Weeks spanning month boundaries appear in both months. Tasks without deadlines still appear in their scheduled month. Tasks are grouped by category in compact rows. Completed tasks appear at the bottom of each category; each group is sorted by deadline, with undated tasks last. Checkboxes save completion to the original daily, weekly, or monthly task and refresh the monthly calendar, statistics, and Monthly Tasks section as applicable. Task titles link to their original planning view. Changes in Monthly Tasks refresh the overview automatically. The shared-study migration described below adds the additional database changes for course tags and synchronized study tasks.

## Shared study tasks

Apply `supabase/migrations/20261113000000_shared_study_tasks.sql` after the task deadline migration. It creates the study task and course-tag tables, links study-category tasks in Daily, Weekly, and Monthly, and adds priorities to weekly and monthly tasks. Existing study entries with the exact same title and deadline are consolidated into one shared task. Other entries are kept separate.

Study tasks with a due date are automatically included on that daily date and in its week and month. Their title, completion, priority, and deadline stay synchronized across those views. Course tags are managed from the Study view using a fixed palette of ten colors. Checked tasks appear in the separate Done view. Undated tasks older than 30 days are archived to Done without changing their checkbox state.
