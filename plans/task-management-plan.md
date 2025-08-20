# Task Management Plan

## Overview
This document outlines the comprehensive plan for implementing task management functionality in the Offline Kanban Desktop App. Tasks are the core entities that both root and normal users can create, with features including auto-archiving, rich content, comments, history tracking, and future image support.

## Current Implementation Analysis

Currently, tasks are hardcoded in the frontend (`frontend/src/App.tsx:55-91`) with basic structure:
- Static task objects with `id`, `title`, `parentId` (column), `type: "card"`
- Basic content with `description` and `priority`
- No database persistence
- No user assignment, comments, or history

## Task Requirements Summary

Based on previous descriptions:

### Core Features
- **Creation**: Both root and normal users can create tasks
- **Auto-archiving**: Tasks can be set to auto-archive after 90 days or remain permanent
- **Rich Details**: Title, content, assignee, comments, history tracking
- **Future Extensions**: Image attachments and other media
- **Filtering**: Advanced filtering by user, date, content, title, comments
- **View Modes**: Kanban board view + dedicated task overview page

### Permission Matrix
| Action | Root User | Normal User |
|--------|-----------|-------------|
| Create tasks | ✅ Yes | ✅ Yes |
| Edit own tasks | ✅ Yes | ✅ Yes |
| Edit others' tasks | ✅ Yes | ❌ No |
| Delete/Archive tasks | ✅ Yes | ❌ No |
| Assign tasks to others | ✅ Yes | ❌ No |
| View all tasks | ✅ Yes | ✅ Yes |
| Comment on tasks | ✅ Yes | ✅ Yes |

## Database Schema Design

### Tasks Table
```sql
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,                        -- Task title
    content TEXT,                              -- Task description/content
    column_id INTEGER NOT NULL,                -- Reference to board column
    assigned_to INTEGER,                       -- User assigned to this task
    created_by INTEGER NOT NULL,              -- User who created the task
    priority TEXT DEFAULT 'medium',           -- Priority: low, medium, high, urgent
    status TEXT DEFAULT 'active',             -- Status: active, completed, archived
    auto_archive_days INTEGER,                -- Days until auto-archive (NULL = never)
    archive_date DATETIME,                    -- Calculated archive date
    completed_at DATETIME,                    -- When task was marked complete
    archived_at DATETIME,                     -- When task was archived
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (column_id) REFERENCES board_columns(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    CHECK (status IN ('active', 'completed', 'archived')),
    CHECK (auto_archive_days IS NULL OR auto_archive_days > 0)
);
```

### Task Comments Table
```sql
CREATE TABLE IF NOT EXISTS task_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Task History Table
```sql
CREATE TABLE IF NOT EXISTS task_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,                     -- created, updated, moved, assigned, commented, archived
    field_name TEXT,                          -- Field that was changed (for updates)
    old_value TEXT,                          -- Previous value
    new_value TEXT,                          -- New value
    description TEXT,                        -- Human-readable description
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    
    CHECK (action IN ('created', 'updated', 'moved', 'assigned', 'commented', 'completed', 'archived', 'unarchived'))
);
```

### Task Attachments Table (Future)
```sql
CREATE TABLE IF NOT EXISTS task_attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_type TEXT NOT NULL,                  -- image/jpeg, image/png, application/pdf, etc.
    file_size INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
```

## Implementation Plan

### Phase 1: Core Task Database Operations

1. **Create Migrations**
   ```go
   // pkg/database/migrations/002_create_tasks.go
   func CreateTasksTables(db *sql.DB) error
   ```

2. **Task Database Operations**
   ```go
   // pkg/database/tasks.go
   type Task struct {
       ID              int       `json:"id"`
       Title           string    `json:"title"`
       Content         *string   `json:"content"`
       ColumnID        int       `json:"column_id"`
       AssignedTo      *int      `json:"assigned_to"`
       CreatedBy       int       `json:"created_by"`
       Priority        string    `json:"priority"`
       Status          string    `json:"status"`
       AutoArchiveDays *int      `json:"auto_archive_days"`
       ArchiveDate     *time.Time `json:"archive_date"`
       CompletedAt     *time.Time `json:"completed_at"`
       ArchivedAt      *time.Time `json:"archived_at"`
       CreatedAt       time.Time `json:"created_at"`
       UpdatedAt       time.Time `json:"updated_at"`
       
       // Loaded relationships
       AssignedUser    *User     `json:"assigned_user,omitempty"`
       CreatedByUser   *User     `json:"created_by_user,omitempty"`
       Column          *Column   `json:"column,omitempty"`
       Comments        []Comment `json:"comments,omitempty"`
       History         []History `json:"history,omitempty"`
   }

   func (d *Database) CreateTask(task *Task) error
   func (d *Database) UpdateTask(id int, updates map[string]interface{}) error
   func (d *Database) MoveTask(id int, columnId int, userId int) error
   func (d *Database) AssignTask(id int, assignedTo *int, assignedBy int) error
   func (d *Database) CompleteTask(id int, userId int) error
   func (d *Database) ArchiveTask(id int, userId int) error
   func (d *Database) GetTask(id int) (*Task, error)
   func (d *Database) GetTasksByColumn(columnId int) ([]*Task, error)
   func (d *Database) GetTasksByUser(userId int, includeArchived bool) ([]*Task, error)
   func (d *Database) GetAllTasks(filters TaskFilters) ([]*Task, error)
   func (d *Database) SearchTasks(query string, filters TaskFilters) ([]*Task, error)
   ```

3. **Auto-Archive System**
   ```go
   func (d *Database) CalculateArchiveDate(createdAt time.Time, autoArchiveDays *int) *time.Time
   func (d *Database) ProcessAutoArchiving() error  // Cron job function
   func (d *Database) GetTasksPendingArchive() ([]*Task, error)
   ```

### Phase 2: Comments and History System

1. **Comment Operations**
   ```go
   // pkg/database/comments.go
   type Comment struct {
       ID        int       `json:"id"`
       TaskID    int       `json:"task_id"`
       UserID    int       `json:"user_id"`
       Comment   string    `json:"comment"`
       CreatedAt time.Time `json:"created_at"`
       UpdatedAt time.Time `json:"updated_at"`
       
       User      *User     `json:"user,omitempty"`
   }

   func (d *Database) AddComment(taskId int, userId int, comment string) error
   func (d *Database) UpdateComment(id int, userId int, comment string) error
   func (d *Database) DeleteComment(id int, userId int) error
   func (d *Database) GetTaskComments(taskId int) ([]*Comment, error)
   ```

2. **History Tracking**
   ```go
   // pkg/database/history.go
   type History struct {
       ID          int       `json:"id"`
       TaskID      int       `json:"task_id"`
       UserID      int       `json:"user_id"`
       Action      string    `json:"action"`
       FieldName   *string   `json:"field_name"`
       OldValue    *string   `json:"old_value"`
       NewValue    *string   `json:"new_value"`
       Description string    `json:"description"`
       CreatedAt   time.Time `json:"created_at"`
       
       User        *User     `json:"user,omitempty"`
   }

   func (d *Database) LogTaskHistory(taskId int, userId int, action string, details HistoryDetails) error
   func (d *Database) GetTaskHistory(taskId int) ([]*History, error)
   ```

### Phase 3: Backend API Implementation

1. **Task Management Methods in `app.go`**
   ```go
   func (a *App) CreateTask(title, content string, columnId int, assignedTo *int, autoArchiveDays *int) error
   func (a *App) UpdateTask(id int, updates map[string]interface{}) error
   func (a *App) MoveTask(id int, columnId int) error
   func (a *App) AssignTask(id int, assignedTo *int) error
   func (a *App) CompleteTask(id int) error
   func (a *App) ArchiveTask(id int) error
   func (a *App) GetTask(id int) (*Task, error)
   func (a *App) GetBoardTasks() (map[string][]*Task, error)  // Grouped by column
   func (a *App) GetAllTasks(filters TaskFilters) ([]*Task, error)
   func (a *App) SearchTasks(query string, filters TaskFilters) ([]*Task, error)
   
   // Comments
   func (a *App) AddTaskComment(taskId int, comment string) error
   func (a *App) UpdateTaskComment(commentId int, comment string) error
   func (a *App) DeleteTaskComment(commentId int) error
   
   // History
   func (a *App) GetTaskHistory(taskId int) ([]*History, error)
   ```

2. **Permission Validation**
   ```go
   func (a *App) canEditTask(taskId int, userId int) bool
   func (a *App) canArchiveTask(taskId int, userId int) bool
   func (a *App) canAssignTask(userId int) bool
   ```

3. **Task Filtering System**
   ```go
   type TaskFilters struct {
       AssignedTo    *int      `json:"assigned_to"`
       CreatedBy     *int      `json:"created_by"`
       Priority      *string   `json:"priority"`
       Status        *string   `json:"status"`
       ColumnID      *int      `json:"column_id"`
       DateFrom      *time.Time `json:"date_from"`
       DateTo        *time.Time `json:"date_to"`
       IncludeArchived bool    `json:"include_archived"`
   }
   ```

### Phase 4: Frontend Task Components

1. **Task Management Components**
   ```typescript
   // frontend/src/components/Tasks/
   - TaskCard.tsx              // Individual task display on board
   - TaskModal.tsx             // Full task details modal
   - CreateTaskModal.tsx       // Create new task modal
   - EditTaskModal.tsx         // Edit task modal
   - TaskList.tsx              // List view of tasks
   - TaskFilters.tsx           // Filter controls
   - TaskComments.tsx          // Comments section
   - TaskHistory.tsx           // History section
   - TaskAssignment.tsx        // User assignment dropdown
   ```

2. **Task Overview Page**
   ```typescript
   // frontend/src/pages/TaskOverview.tsx
   - Advanced filtering interface
   - Sortable table view
   - Bulk operations
   - Export functionality
   - Search with highlighting
   ```

3. **Task Hooks**
   ```typescript
   // frontend/src/hooks/useTasks.tsx
   const useTasks = () => {
     const [tasks, setTasks] = useState<Task[]>([]);
     const [boardTasks, setBoardTasks] = useState<{[columnId: string]: Task[]}>({});
     
     const createTask = async (data: CreateTaskData) => {};
     const updateTask = async (id: number, data: UpdateTaskData) => {};
     const moveTask = async (id: number, columnId: number) => {};
     const assignTask = async (id: number, assignedTo: number | null) => {};
     const completeTask = async (id: number) => {};
     const archiveTask = async (id: number) => {};
     const searchTasks = async (query: string, filters: TaskFilters) => {};
     
     return { tasks, boardTasks, createTask, updateTask, moveTask, assignTask, completeTask, archiveTask };
   };
   ```

### Phase 5: Advanced Task Features

1. **Auto-Archive System**
   ```go
   // Background service to handle auto-archiving
   func StartAutoArchiveService(db *Database) {
       ticker := time.NewTicker(24 * time.Hour)
       go func() {
           for {
               select {
               case <-ticker.C:
                   db.ProcessAutoArchiving()
               }
           }
       }()
   }
   ```

2. **Task Templates (Future)**
   ```sql
   CREATE TABLE task_templates (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       name TEXT NOT NULL,
       title_template TEXT NOT NULL,
       content_template TEXT,
       default_priority TEXT DEFAULT 'medium',
       default_auto_archive_days INTEGER,
       created_by INTEGER NOT NULL
   );
   ```

3. **Task Dependencies (Future)**
   ```sql
   CREATE TABLE task_dependencies (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       task_id INTEGER NOT NULL,
       depends_on_task_id INTEGER NOT NULL,
       dependency_type TEXT DEFAULT 'blocks'  -- blocks, related
   );
   ```

### Phase 6: Task Search and Filtering

1. **Advanced Search Implementation**
   ```go
   func (d *Database) SearchTasks(query string, filters TaskFilters) ([]*Task, error) {
       // Full-text search across title, content, comments
       // Support for operators: AND, OR, quotes, exclusion (-)
       // Field-specific search: title:homepage, assignee:john
   }
   ```

2. **Filter Combinations**
   - User-based: Created by, Assigned to
   - Time-based: Created date, Due date, Archive date
   - Content-based: Title contains, Content contains, Has comments
   - Status-based: Priority, Status, Column
   - Advanced: Has attachments, Overdue, Recently updated

## File Structure Changes

```
offline_kanban/
├── pkg/
│   ├── database/
│   │   ├── migrations/
│   │   │   └── 002_create_tasks.go (new)
│   │   ├── tasks.go (new)
│   │   ├── comments.go (new)
│   │   ├── history.go (new)
│   │   └── database.go (updated)
│   ├── models/
│   │   ├── task.go (new)
│   │   ├── comment.go (new)
│   │   └── history.go (new)
│   └── services/
│       └── auto_archive.go (new)
├── frontend/src/
│   ├── components/
│   │   └── Tasks/ (new)
│   ├── pages/
│   │   └── TaskOverview.tsx (new)
│   ├── hooks/
│   │   ├── useTasks.tsx (new)
│   │   └── useTaskFilters.tsx (new)
│   ├── types/
│   │   ├── task.ts (new)
│   │   ├── comment.ts (new)
│   │   └── history.ts (new)
│   └── services/
│       └── taskService.ts (new)
```

## Auto-Archive Logic

### Archive Date Calculation
```go
func CalculateArchiveDate(createdAt time.Time, autoArchiveDays *int) *time.Time {
    if autoArchiveDays == nil {
        return nil  // Never archive
    }
    archiveDate := createdAt.AddDate(0, 0, *autoArchiveDays)
    return &archiveDate
}
```

### Auto-Archive Process
1. **Daily Check**: Background service runs every 24 hours
2. **Find Candidates**: Tasks with `archive_date <= NOW()` and `status != 'archived'`
3. **Archive Tasks**: Update status to 'archived', set `archived_at`
4. **Log History**: Record auto-archive action in task history
5. **Notifications**: Optional notification to task creator/assignee

## Testing Strategy

### Database Tests
- Task CRUD operations with all relationships
- Comment and history tracking
- Auto-archive logic and date calculations
- Search and filtering functionality
- Permission validation

### Backend API Tests
- Task creation with different user types
- Task updates and permission checks
- Move tasks between columns
- Archive/unarchive workflows
- Comment operations

### Frontend Tests
- Task creation and editing flows
- Drag-and-drop between columns
- Filter and search functionality
- Real-time task updates
- Comment and history display

## Success Criteria

- [ ] Both root and normal users can create tasks
- [ ] Tasks support auto-archiving after configurable days
- [ ] Rich task details: title, content, assignee, comments, history
- [ ] Advanced filtering by user, date, content, title, comments
- [ ] Dedicated task overview page with search and filters
- [ ] Real-time task updates across board and overview
- [ ] Comment system with history tracking
- [ ] Permission system prevents unauthorized actions
- [ ] Auto-archive system works reliably
- [ ] Future-ready for image attachments and extensions

## Timeline Estimation

- **Phase 1**: 4-5 days (Core task database)
- **Phase 2**: 3-4 days (Comments and history)
- **Phase 3**: 4-5 days (Backend API)
- **Phase 4**: 5-7 days (Frontend components)
- **Phase 5**: 3-4 days (Advanced features)
- **Phase 6**: 3-4 days (Search and filtering)

**Total Estimated Time**: 22-29 days

## Notes

- Task deletion is replaced with archiving for data integrity
- Auto-archive is optional per task, defaulting to never expire
- History tracking captures all significant task changes
- Comment system supports real-time collaboration
- Search functionality includes content, title, and comments
- Permission system ensures users can only edit their own tasks (except root)
- Future image support is architecturally planned