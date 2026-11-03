

## Task deadlines

Daily, weekly, and monthly tasks support an optional deadline date. Set it when adding a task, or change or clear it in the task row. Copying a task preserves its deadline.

Before using this feature, apply `supabase/migrations/20261103000000_add_task_deadlines.sql` to the connected Supabase database using the SQL editor or your normal migration workflow. Existing tasks retain a null deadline.
