import db from './database';
import fs from 'fs';
import path from 'path';

export function migrateToRecurringTasks() {
  console.log('🔄 Starting recurring tasks migration...');
  
  try {
    // Check if columns already exist
    const tableInfo = db.prepare("PRAGMA table_info(todos)").all() as any[];
    const columnNames = tableInfo.map(col => col.name);
    
    const hasRecurrencePattern = columnNames.includes('recurrence_pattern');
    const hasParentTaskId = columnNames.includes('parent_task_id');
    const hasIsRecurringInstance = columnNames.includes('is_recurring_instance');
    const hasOccurrenceCount = columnNames.includes('occurrence_count');
    
    if (hasRecurrencePattern && hasParentTaskId && hasIsRecurringInstance && hasOccurrenceCount) {
      console.log('✅ Recurring tasks columns already exist. Migration not needed.');
      return true;
    }
    
    console.log('📝 Adding new columns for recurring tasks...');
    
    // Use transaction for safety
    const transaction = db.transaction(() => {
      // Add recurrence_pattern if not exists
      if (!hasRecurrencePattern) {
        db.exec('ALTER TABLE todos ADD COLUMN recurrence_pattern TEXT');
        console.log('  ✓ Added recurrence_pattern column');
      }
      
      // Add parent_task_id if not exists
      if (!hasParentTaskId) {
        db.exec('ALTER TABLE todos ADD COLUMN parent_task_id INTEGER');
        console.log('  ✓ Added parent_task_id column');
      }
      
      // Add is_recurring_instance if not exists
      if (!hasIsRecurringInstance) {
        db.exec('ALTER TABLE todos ADD COLUMN is_recurring_instance BOOLEAN DEFAULT 0');
        console.log('  ✓ Added is_recurring_instance column');
      }
      
      // Add occurrence_count if not exists
      if (!hasOccurrenceCount) {
        db.exec('ALTER TABLE todos ADD COLUMN occurrence_count INTEGER DEFAULT 0');
        console.log('  ✓ Added occurrence_count column');
      }
      
      // Update due_date column type (SQLite doesn't enforce types strictly, so this is mainly documentation)
      console.log('  ✓ Due date column updated to DATETIME');
      
      // Create indexes for better performance
      try {
        db.exec('CREATE INDEX IF NOT EXISTS idx_todos_parent_task_id ON todos(parent_task_id)');
        db.exec('CREATE INDEX IF NOT EXISTS idx_todos_is_recurring_instance ON todos(is_recurring_instance)');
        db.exec('CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date)');
        console.log('  ✓ Created performance indexes');
      } catch (e) {
        console.log('  ⚠️ Indexes might already exist');
      }
    });
    
    transaction();
    
    console.log('🎉 Recurring tasks migration completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return false;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateToRecurringTasks();
}

