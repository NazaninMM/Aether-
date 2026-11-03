

## Task deadlines

Daily, weekly, and monthly tasks support an optional deadline date. Set it when adding a task, or change or clear it in the task row. Copying a task preserves its deadline.

Before using this feature, apply `supabase/migrations/20261103000000_add_task_deadlines.sql` to the connected Supabase database using the SQL editor or your normal migration workflow. Existing tasks retain a null deadline.

## Monthly task overview

The separate All Tasks This Month list includes daily, weekly, and monthly tasks when their scheduled period overlaps the selected month or their deadline falls within it. A January task due in February appears in both months, once per month. Weeks spanning month boundaries appear in both months. Tasks without deadlines still appear in their scheduled month. Completed tasks appear at the bottom; each group is sorted by deadline, with undated tasks last. Task titles link to their original planning view. Changes in Monthly Tasks refresh the overview automatically. No additional database migration is required beyond the deadline columns.
