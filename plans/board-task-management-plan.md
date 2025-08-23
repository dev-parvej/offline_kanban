# Board Task Management Plan

## Overview
This document outlines the updated plan for implementing task management functionality specifically focused on board interactions with refined permissions and Jira-like filtering. This plan supersedes the general task management plan with board-specific requirements.

## Updated Permission Matrix

| Action | Root User | Normal User | Notes |
|--------|-----------|-------------|--------|
| Create tasks | ✅ Yes | ✅ Yes | Can create in any column |
| Edit own tasks | ✅ Yes | ✅ Yes | Full editing rights for own tasks |
| Edit others' tasks | ✅ Yes | ❌ No | Root can edit any task |
| Delete/Archive tasks | ✅ Yes | ❌ No | Only root can archive |
| **Assign tasks to others** | ✅ Yes | ❌ No | Root can assign to anyone |
| **Assign unassigned task to self** | ✅ Yes | ✅ Yes | Normal user can take unassigned tasks |
| **Move own assigned tasks** | ✅ Yes | ✅ Yes | Can move between columns |
| **Move others' tasks** | ✅ Yes | ❌ No | Only root can move others' tasks |
| **Comment on any task** | ✅ Yes | ✅ Yes | Anyone can comment on any task |
| View all tasks | ✅ Yes | ✅ Yes | Read access to all tasks |

## Board-Specific Requirements

### Task Assignment Rules
1. **Unassigned Tasks**: Tasks with `assigned_to = NULL`
   - Root user: Can assign to anyone
   - Normal user: Can assign to themselves only
   
2. **Assigned Tasks**: Tasks with `assigned_to != NULL`
   - Root user: Can reassign to anyone
   - Normal user: Cannot change assignment (even their own)

3. **Task Movement Rules**
   - Root user: Can move any task to any column
   - Normal user: Can only move tasks assigned to them
   - Unassigned tasks: Cannot be moved by normal users

### Board Filtering (Jira-style)

**Simple Filter Bar** (No advanced search, just like Jira basic filters):
- **Search Text**: Single search box for title and content
- **Assignee Filter**: Dropdown with "All", "Unassigned", "Assigned to me", individual users
- **Creator Filter**: Dropdown with "All", "Created by me", individual users
- **Quick Filters**: Toggle buttons for common filters

## Database Schema Updates

### Tasks Table Status

**CURRENT IMPLEMENTATION:**
```sql
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,                          -- CURRENT: description instead of content
    column_id INTEGER NOT NULL,
    assigned_to INTEGER,                       -- ✅ NULL means unassigned
    created_by INTEGER NOT NULL,              -- ✅ Implemented
    due_date DATETIME,                         -- CURRENT: has due_date
    priority varchar NULL,                     -- CURRENT: varchar, nullable
    position INTEGER NOT NULL,                 -- CURRENT: has position field
    weight INTEGER default 0,                 -- CURRENT: has weight field
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE SET NULL,  -- CURRENT: columns table
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
```

**MISSING FIELDS (Need Migration):**
- `status` - For active/completed/archived states
- `auto_archive_days` - Auto-archiving functionality
- `archive_date` - Calculated archive date
- `completed_at` - Task completion timestamp
- `archived_at` - Task archiving timestamp
- Priority and status constraints

**TARGET ENHANCED SCHEMA:**
```sql
-- After migration:
ALTER TABLE tasks ADD COLUMN status TEXT DEFAULT 'active';
ALTER TABLE tasks ADD COLUMN auto_archive_days INTEGER;
ALTER TABLE tasks ADD COLUMN archive_date DATETIME;
ALTER TABLE tasks ADD COLUMN completed_at DATETIME;
ALTER TABLE tasks ADD COLUMN archived_at DATETIME;
ALTER TABLE tasks ADD CONSTRAINT priority_check CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
ALTER TABLE tasks ADD CONSTRAINT status_check CHECK (status IN ('active', 'completed', 'archived'));
```

### Board Filter State Table (NOT IMPLEMENTED)
**STATUS: TO BE CREATED**

```sql
CREATE TABLE IF NOT EXISTS board_filters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    filter_name TEXT NOT NULL,
    search_text TEXT,
    assignee_filter TEXT,                      -- 'all', 'unassigned', 'me', 'user:123'
    creator_filter TEXT,                       -- 'all', 'me', 'user:123'
    quick_filters TEXT,                        -- JSON array of active quick filters
    is_default BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Implementation Status & Plan

**Current Status**:
- ✅ Basic tasks table exists
- ✅ User assignment supported
- ✅ Comments system exists
- ❌ Permission system not implemented
- ❌ Board filtering not implemented
- ❌ Task status management missing
- ❌ Assignment workflow missing

**Database Dependencies**:
- ✅ Tasks table exists (needs enhancement)
- ✅ Users table exists (needs name field)
- ✅ Comments table exists
- ❌ Board filters table missing

### Phase 1: Updated Task Permission System

1. **Permission Validation Functions**
   ```go
   // pkg/services/task_permissions.go
   type TaskPermissions struct {
       db *database.Database
   }

   func (tp *TaskPermissions) CanAssignTask(userId int, taskId int, assigneeId *int) bool {
       // Root user: can assign anyone to any task
       // Normal user: can only assign unassigned tasks to themselves
   }

   func (tp *TaskPermissions) CanMoveTask(userId int, taskId int, newColumnId int) bool {
       // Root user: can move any task
       // Normal user: can only move tasks assigned to them
   }

   func (tp *TaskPermissions) CanEditTask(userId int, taskId int) bool {
       // Root user: can edit any task
       // Normal user: can only edit their own tasks (created_by OR assigned_to)
   }

   func (tp *TaskPermissions) CanCommentTask(userId int, taskId int) bool {
       // Anyone can comment on any task
       return true
   }
   ```

2. **Updated Database Methods**
   ```go
   // pkg/database/tasks.go
   func (d *Database) AssignTaskToSelf(taskId int, userId int) error {
       // Only allow if task is unassigned
   }

   func (d *Database) AssignTaskToUser(taskId int, assigneeId *int, assignerId int) error {
       // Check if assigner has permission
   }

   func (d *Database) MoveTaskWithPermission(taskId int, columnId int, userId int) error {
       // Validate user can move this task
   }

   func (d *Database) GetMovableTasksForUser(userId int, columnId int) ([]*Task, error) {
       // Return tasks user can move (root: all, normal: assigned to them)
   }
   ```

### Phase 2: Board Filtering System

1. **Filter Types and Structure**
   ```go
   // pkg/models/board_filter.go
   type BoardFilter struct {
       SearchText     string            `json:"search_text"`
       AssigneeFilter string            `json:"assignee_filter"`  // "all", "unassigned", "me", "user:123"
       CreatorFilter  string            `json:"creator_filter"`   // "all", "me", "user:123"
       QuickFilters   []string          `json:"quick_filters"`    // ["my-tasks", "unassigned", "overdue"]
   }

   type FilterOption struct {
       Value string `json:"value"`
       Label string `json:"label"`
       Count int    `json:"count"`  // Number of tasks matching this filter
   }
   ```

2. **Filter Processing Functions**
   ```go
   // pkg/services/board_filter.go
   func (bf *BoardFilter) ApplyFilters(tasks []*Task, currentUserId int) []*Task

   func BuildAssigneeFilterOptions(tasks []*Task) []FilterOption
   func BuildCreatorFilterOptions(tasks []*Task) []FilterOption

   func FilterBySearchText(tasks []*Task, searchText string) []*Task
   func FilterByAssignee(tasks []*Task, assigneeFilter string, currentUserId int) []*Task
   func FilterByCreator(tasks []*Task, creatorFilter string, currentUserId int) []*Task
   func FilterByQuickFilters(tasks []*Task, quickFilters []string, currentUserId int) []*Task
   ```

3. **Database Filter Queries**
   ```go
   // pkg/database/board_filtering.go
   func (d *Database) GetFilteredBoardTasks(filter BoardFilter, userId int) (map[int][]*Task, error) {
       // Returns tasks grouped by column_id with filters applied
   }

   func (d *Database) GetTaskCountsByFilter(userId int) (map[string]int, error) {
       // Returns counts for filter options: {"assigned_to_me": 5, "unassigned": 3}
   }
   ```

### Phase 3: Backend API Updates

1. **Updated App Methods**
   ```go
   // app.go - Updated methods with permissions
   func (a *App) AssignTaskToSelf(taskId int) error {
       userId := a.getCurrentUserId()  // From session
       return a.permissions.AssignTaskToSelf(taskId, userId)
   }

   func (a *App) AssignTaskToUser(taskId int, assigneeId *int) error {
       userId := a.getCurrentUserId()
       return a.permissions.AssignTaskToUser(taskId, assigneeId, userId)
   }

   func (a *App) MoveTask(taskId int, columnId int) error {
       userId := a.getCurrentUserId()
       return a.permissions.MoveTaskWithPermission(taskId, columnId, userId)
   }

   func (a *App) GetBoardTasks(filter BoardFilter) (map[string][]*Task, error) {
       userId := a.getCurrentUserId()
       return a.db.GetFilteredBoardTasks(filter, userId)
   }

   func (a *App) GetFilterOptions() (FilterOptions, error) {
       // Return available assignees, creators, and counts
   }
   ```

### Phase 4: Frontend Board Implementation

1. **Board Filter Components**
   ```typescript
   // frontend/src/components/Board/
   - BoardHeader.tsx           // Filter bar and controls
   - BoardFilters.tsx          // Filter dropdown and search
   - QuickFilters.tsx          // Toggle buttons for common filters
   - AssigneeDropdown.tsx      // Assignee selection with counts
   - SearchBox.tsx             // Title/content search
   ```

2. **Filter State Management**
   ```typescript
   // frontend/src/hooks/useBoardFilters.tsx
   interface BoardFilter {
     searchText: string;
     assigneeFilter: 'all' | 'unassigned' | 'me' | `user:${number}`;
     creatorFilter: 'all' | 'me' | `user:${number}`;
     quickFilters: string[];
   }

   const useBoardFilters = () => {
     const [filters, setFilters] = useState<BoardFilter>({
       searchText: '',
       assigneeFilter: 'all',
       creatorFilter: 'all',
       quickFilters: []
     });

     const [filterOptions, setFilterOptions] = useState<FilterOptions>();
     const [taskCounts, setTaskCounts] = useState<{[key: string]: number}>();

     const updateFilter = (key: keyof BoardFilter, value: any) => {
       setFilters(prev => ({ ...prev, [key]: value }));
     };

     const clearFilters = () => {
       setFilters({
         searchText: '',
         assigneeFilter: 'all',
         creatorFilter: 'all',
         quickFilters: []
       });
     };

     return { filters, updateFilter, clearFilters, filterOptions, taskCounts };
   };
   ```

3. **Updated Task Card Component**
   ```typescript
   // frontend/src/components/Board/TaskCard.tsx
   interface TaskCardProps {
     task: Task;
     isMovable: boolean;        // Based on user permissions
     onAssignToSelf?: () => void;
     onReassign?: (assigneeId: number | null) => void;
     canAssign: boolean;        // Based on user role and task state
   }

   const TaskCard: React.FC<TaskCardProps> = ({ task, isMovable, canAssign, onAssignToSelf, onReassign }) => {
     return (
       <div className={`task-card ${!isMovable ? 'not-movable' : ''}`}>
         <div className="task-header">
           <h3>{task.title}</h3>
           {task.assigned_to ? (
             <UserAvatar user={task.assigned_user} />
           ) : (
             canAssign && <Button onClick={onAssignToSelf}>Assign to me</Button>
           )}
         </div>
         <p>{task.content}</p>
         <TaskPriority priority={task.priority} />
       </div>
     );
   };
   ```

### Phase 5: Board Interaction Logic

1. **Task Assignment Logic**
   ```typescript
   // frontend/src/services/taskAssignment.ts
   export const canUserAssignTask = (user: User, task: Task): boolean => {
     if (user.is_root) return true;
     return task.assigned_to === null; // Normal user can only assign unassigned tasks to self
   };

   export const canUserMoveTask = (user: User, task: Task): boolean => {
     if (user.is_root) return true;
     return task.assigned_to === user.id; // Normal user can only move their assigned tasks
   };

   export const getAssignmentOptions = (user: User, task: Task, allUsers: User[]): AssignmentOption[] => {
     if (user.is_root) {
       return [
         { value: null, label: 'Unassigned' },
         ...allUsers.map(u => ({ value: u.id, label: u.name }))
       ];
     }
     
     if (task.assigned_to === null) {
       return [{ value: user.id, label: 'Assign to me' }];
     }
     
     return []; // Normal user cannot reassign assigned tasks
   };
   ```

2. **Board State Management**
   ```typescript
   // frontend/src/hooks/useBoard.tsx
   const useBoard = () => {
     const [columns, setColumns] = useState<Column[]>([]);
     const [tasks, setTasks] = useState<{[columnId: string]: Task[]}>({});
     const [filters, setFilters] = useState<BoardFilter>();
     const { user } = useAuth();

     const moveTask = async (taskId: number, fromColumnId: number, toColumnId: number) => {
       const task = findTaskById(taskId);
       
       if (!canUserMoveTask(user, task)) {
         toast.error('You can only move tasks assigned to you');
         return false;
       }

       try {
         await taskService.moveTask(taskId, toColumnId);
         // Update local state
         return true;
       } catch (error) {
         toast.error('Failed to move task');
         return false;
       }
     };

     const assignTask = async (taskId: number, assigneeId: number | null) => {
       const task = findTaskById(taskId);
       
       if (!canUserAssignTask(user, task)) {
         toast.error('Cannot assign this task');
         return;
       }

       try {
         if (user.is_root) {
           await taskService.assignTaskToUser(taskId, assigneeId);
         } else {
           await taskService.assignTaskToSelf(taskId);
         }
         // Update local state
       } catch (error) {
         toast.error('Failed to assign task');
       }
     };

     return { columns, tasks, filters, moveTask, assignTask };
   };
   ```

### Phase 6: Board UI Components

1. **Filter Bar Component**
   ```typescript
   // frontend/src/components/Board/BoardFilterBar.tsx
   const BoardFilterBar: React.FC = () => {
     const { filters, updateFilter, filterOptions, taskCounts } = useBoardFilters();

     return (
       <div className="board-filter-bar">
         <div className="search-section">
           <SearchBox 
             value={filters.searchText}
             onChange={(value) => updateFilter('searchText', value)}
             placeholder="Search tasks..."
           />
         </div>
         
         <div className="filter-dropdowns">
           <AssigneeDropdown
             value={filters.assigneeFilter}
             onChange={(value) => updateFilter('assigneeFilter', value)}
             options={filterOptions?.assignees || []}
             counts={taskCounts}
           />
           
           <CreatorDropdown
             value={filters.creatorFilter}
             onChange={(value) => updateFilter('creatorFilter', value)}
             options={filterOptions?.creators || []}
             counts={taskCounts}
           />
         </div>

         <QuickFilters 
           active={filters.quickFilters}
           onChange={(quickFilters) => updateFilter('quickFilters', quickFilters)}
         />
       </div>
     );
   };
   ```

2. **Updated Board Component**
   ```typescript
   // frontend/src/components/Board/KanbanBoard.tsx
   const KanbanBoard: React.FC = () => {
     const { user } = useAuth();
     const { columns, tasks, moveTask, assignTask } = useBoard();
     const { filters } = useBoardFilters();

     const handleTaskMove = (taskId: number, fromColumnId: number, toColumnId: number) => {
       return moveTask(taskId, fromColumnId, toColumnId);
     };

     const handleAssignToSelf = (taskId: number) => {
       assignTask(taskId, user.id);
     };

     const handleReassignTask = (taskId: number, assigneeId: number | null) => {
       if (user.is_root) {
         assignTask(taskId, assigneeId);
       }
     };

     return (
       <div className="kanban-board">
         <BoardFilterBar />
         
         <div className="board-columns">
           {columns.map(column => (
             <BoardColumn 
               key={column.id}
               column={column}
               tasks={tasks[column.id] || []}
               onTaskMove={handleTaskMove}
               onAssignToSelf={handleAssignToSelf}
               onReassignTask={handleReassignTask}
               currentUser={user}
             />
           ))}
         </div>
       </div>
     );
   };
   ```

## File Structure Changes

```
offline_kanban/
├── pkg/
│   ├── services/
│   │   ├── task_permissions.go (new)
│   │   └── board_filter.go (new)
│   ├── database/
│   │   └── board_filtering.go (new)
│   └── models/
│       └── board_filter.go (new)
├── frontend/src/
│   ├── components/
│   │   └── Board/ (new)
│   │       ├── BoardFilterBar.tsx
│   │       ├── BoardFilters.tsx
│   │       ├── QuickFilters.tsx
│   │       ├── AssigneeDropdown.tsx
│   │       ├── SearchBox.tsx
│   │       ├── TaskCard.tsx (updated)
│   │       └── KanbanBoard.tsx (updated)
│   ├── hooks/
│   │   ├── useBoardFilters.tsx (new)
│   │   └── useBoard.tsx (new)
│   ├── services/
│   │   └── taskAssignment.ts (new)
│   └── types/
│       └── board.ts (new)
```

## Filter Examples (Jira-style)

### Search Text
- "homepage design" → Matches tasks with "homepage" OR "design" in title/content
- Case-insensitive search
- Partial word matching

### Assignee Filter Options
- "All" → Show all tasks
- "Unassigned" → Tasks with assigned_to = NULL
- "Assigned to me" → Tasks assigned to current user
- "John Doe" → Tasks assigned to specific user

### Creator Filter Options  
- "All" → Show all tasks
- "Created by me" → Tasks created by current user
- "John Doe" → Tasks created by specific user

### Quick Filters (Toggle buttons)
- "My Tasks" → assigned_to = current_user
- "Unassigned" → assigned_to = NULL
- "High Priority" → priority = 'high' OR priority = 'urgent'
- "Due Soon" → archive_date within next 7 days

## Permission Validation Examples

### Task Assignment Scenarios
```typescript
// Scenario 1: Root user assigns unassigned task
rootUser.assignTask(unassignedTask, someUser) → ✅ Allowed

// Scenario 2: Root user reassigns assigned task  
rootUser.assignTask(assignedTask, anotherUser) → ✅ Allowed

// Scenario 3: Normal user assigns unassigned task to self
normalUser.assignTask(unassignedTask, normalUser) → ✅ Allowed

// Scenario 4: Normal user tries to assign unassigned task to others
normalUser.assignTask(unassignedTask, otherUser) → ❌ Denied

// Scenario 5: Normal user tries to reassign their own task
normalUser.assignTask(taskAssignedToThem, otherUser) → ❌ Denied
```

### Task Movement Scenarios
```typescript
// Scenario 1: Root user moves any task
rootUser.moveTask(anyTask, newColumn) → ✅ Allowed

// Scenario 2: Normal user moves their assigned task
normalUser.moveTask(taskAssignedToThem, newColumn) → ✅ Allowed

// Scenario 3: Normal user tries to move others' task
normalUser.moveTask(taskAssignedToOthers, newColumn) → ❌ Denied

// Scenario 4: Normal user tries to move unassigned task
normalUser.moveTask(unassignedTask, newColumn) → ❌ Denied
```

## Success Criteria

- [ ] Root users can assign any task to any user
- [ ] Normal users can only assign unassigned tasks to themselves
- [ ] Normal users can only move their assigned tasks
- [ ] Anyone can comment on any task
- [ ] Board filtering works like Jira (simple, not advanced)
- [ ] Filter by title, content, assignee, creator
- [ ] Quick filter toggles for common scenarios
- [ ] Real-time filter updates with task counts
- [ ] Drag-and-drop respects permission rules
- [ ] Visual indicators for movable/non-movable tasks

## Timeline Estimation

- **Phase 1**: 3-4 days (Permission system)
- **Phase 2**: 4-5 days (Filtering system) 
- **Phase 3**: 3-4 days (Backend API updates)
- **Phase 4**: 4-5 days (Frontend filter components)
- **Phase 5**: 3-4 days (Board interaction logic)
- **Phase 6**: 4-5 days (Board UI components)

**Total Estimated Time**: 21-27 days

## Phase 2 Enhancements

### Advanced Task Features
- Task due dates with overdue indicators and notifications
- Task priority visualization with color coding on board
- Task time tracking and effort logging
- Task labels and custom tags for categorization

### Enhanced Board Interactions
- Bulk task operations (multi-select and batch actions)
- Advanced keyboard shortcuts for power users
- Task quick-add from board columns
- Drag-and-drop task duplication

### Productivity Features
- Task templates for common task types
- Saved filter combinations for quick access
- Task dependencies and blocking relationships
- Board-level task statistics and metrics

### Integration Features
- Task import/export capabilities
- Board backup and restore functionality
- Advanced search across all task fields
- Task activity timeline and detailed history

## Notes

- Assignment rules prioritize task ownership and prevent unauthorized changes
- Movement permissions ensure users only manage their own work
- Commenting remains open for collaboration
- Filtering is intentionally simple (Jira-style) vs complex search
- Visual cues help users understand what they can/cannot interact with
- Real-time updates maintain filter accuracy across user actions
- Phase 2 features enhance productivity while maintaining permission integrity