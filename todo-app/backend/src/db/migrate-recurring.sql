-- Migration script for recurring tasks support
-- Add new columns to todos table

-- Change due_date from DATE to DATETIME
ALTER TABLE todos RENAME COLUMN due_date TO due_date_old;
ALTER TABLE todos ADD COLUMN due_date DATETIME;
UPDATE todos SET due_date = due_date_old WHERE due_date_old IS NOT NULL;
ALTER TABLE todos DROP COLUMN due_date_old;

-- Add recurring task fields
ALTER TABLE todos ADD COLUMN recurrence_pattern TEXT;
ALTER TABLE todos ADD COLUMN parent_task_id INTEGER;
ALTER TABLE todos ADD COLUMN is_recurring_instance BOOLEAN DEFAULT 0;
ALTER TABLE todos ADD COLUMN occurrence_count INTEGER DEFAULT 0;

-- Add foreign key constraint
-- Note: SQLite doesn't support adding foreign keys to existing tables easily
-- So we'll handle the constraint in the application logic

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_todos_parent_task_id ON todos(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_todos_is_recurring_instance ON todos(is_recurring_instance);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);

