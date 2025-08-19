# Task List Page Management Plan

## Overview
This document outlines the plan for implementing the comprehensive task list/search page where all users can view and search through all tasks in the system. This page provides a different interface from the board view, focusing on advanced filtering, detailed task information, and administrative controls for root users.

## Page Purpose and Scope
The Task List page serves as a comprehensive task management interface that complements the board view:
- **View Mode**: Table/list view of all tasks across all columns
- **Search & Filter**: Advanced filtering by user, date, content, title, comments
- **Task Details**: Full task information including comments and history
- **Administrative Controls**: Root-only task management capabilities

## Permission Matrix for Task List Page

| Action | Root User | Normal User | Notes |
|--------|-----------|-------------|--------|
| **View all tasks** | ✅ Yes | ✅ Yes | Complete read access to all tasks |
| **View task details** | ✅ Yes | ✅ Yes | Including content, assignee, history |
| **View all comments** | ✅ Yes | ✅ Yes | Read access to all task comments |
| **Add comments** | ✅ Yes | ✅ Yes | Can comment on any task |
| **Edit own comments** | ✅ Yes | ✅ Yes | Can edit their own comments only |
| **Move tasks between columns** | ✅ Yes | ❌ No | Root-only via dropdown/selector |
| **Assign/reassign tasks** | ✅ Yes | ❌ No | Root-only user assignment |
| **Archive tasks** | ✅ Yes | ❌ No | Root-only archive capability |
| **Edit task details** | ✅ Yes | ❌ No | Root can edit any task |
| **Create new tasks** | ✅ Yes | ✅ Yes | Both can create tasks from list page |

## Database Requirements

### Task List Queries
```sql
-- Get all tasks with filtering support
SELECT 
    t.*,
    u1.name as assigned_user_name,
    u2.name as created_by_user_name,
    bc.title as column_title,
    COUNT(tc.id) as comment_count
FROM tasks t
LEFT JOIN users u1 ON t.assigned_to = u1.id
LEFT JOIN users u2 ON t.created_by = u2.id
LEFT JOIN board_columns bc ON t.column_id = bc.id
LEFT JOIN task_comments tc ON t.id = tc.task_id
WHERE 
    (t.title LIKE ? OR t.content LIKE ?)  -- Search text
    AND (? IS NULL OR t.assigned_to = ?)   -- Assignee filter
    AND (? IS NULL OR t.created_by = ?)    -- Creator filter
    AND (? IS NULL OR t.created_at >= ?)   -- Date from
    AND (? IS NULL OR t.created_at <= ?)   -- Date to
    AND (? = 1 OR t.status != 'archived') -- Include archived
GROUP BY t.id
ORDER BY t.updated_at DESC;
```

### Task Search with Comments
```sql
-- Search within task comments as well
SELECT DISTINCT t.*
FROM tasks t
LEFT JOIN task_comments tc ON t.id = tc.task_id
WHERE 
    t.title LIKE ? 
    OR t.content LIKE ?
    OR tc.comment LIKE ?;
```

## Implementation Plan

### Phase 1: Task List Data Layer

1. **Enhanced Task Queries**
   ```go
   // pkg/database/task_list.go
   type TaskListFilters struct {
       SearchText      *string    `json:"search_text"`
       AssigneeId      *int       `json:"assignee_id"`
       CreatorId       *int       `json:"creator_id"`
       ColumnId        *int       `json:"column_id"`
       Priority        *string    `json:"priority"`
       Status          *string    `json:"status"`
       DateFrom        *time.Time `json:"date_from"`
       DateTo          *time.Time `json:"date_to"`
       IncludeArchived bool       `json:"include_archived"`
       SortBy          string     `json:"sort_by"`      // "title", "created_at", "updated_at", "assignee"
       SortOrder       string     `json:"sort_order"`   // "asc", "desc"
       Limit           *int       `json:"limit"`
       Offset          *int       `json:"offset"`
   }

   type TaskListItem struct {
       *Task
       AssignedUserName  *string `json:"assigned_user_name"`
       CreatedByUserName string  `json:"created_by_user_name"`
       ColumnTitle       string  `json:"column_title"`
       CommentCount      int     `json:"comment_count"`
       LastCommentAt     *time.Time `json:"last_comment_at"`
   }

   func (d *Database) GetTaskList(filters TaskListFilters) ([]*TaskListItem, error)
   func (d *Database) GetTaskListCount(filters TaskListFilters) (int, error)
   func (d *Database) SearchTasksWithComments(searchText string, filters TaskListFilters) ([]*TaskListItem, error)
   ```

### Phase 2: Backend API for Task List

1. **Task List Management Methods**
   ```go
   // app.go - Task List specific methods
   func (a *App) GetTaskList(filters TaskListFilters) ([]*TaskListItem, error) {
       return a.db.GetTaskList(filters)
   }

   func (a *App) GetTaskListCount(filters TaskListFilters) (int, error) {
       return a.db.GetTaskListCount(filters)
   }

   func (a *App) SearchTasks(searchText string, filters TaskListFilters) ([]*TaskListItem, error) {
       return a.db.SearchTasksWithComments(searchText, filters)
   }

   // Root-only task management from list page
   func (a *App) MoveTaskFromList(taskId int, columnId int) error {
       if !a.isRootUser() {
           return errors.New("permission denied: only root users can move tasks")
       }
       return a.db.MoveTask(taskId, columnId, a.getCurrentUserId())
   }

   func (a *App) AssignTaskFromList(taskId int, assigneeId *int) error {
       if !a.isRootUser() {
           return errors.New("permission denied: only root users can assign tasks")
       }
       return a.db.AssignTask(taskId, assigneeId, a.getCurrentUserId())
   }

   func (a *App) ArchiveTaskFromList(taskId int) error {
       if !a.isRootUser() {
           return errors.New("permission denied: only root users can archive tasks")
       }
       return a.db.ArchiveTask(taskId, a.getCurrentUserId())
   }
   ```

### Phase 3: Frontend Task List Components

1. **Main Task List Page**
   ```typescript
   // frontend/src/pages/TaskList.tsx
   const TaskListPage: React.FC = () => {
     const { user } = useAuth();
     const {
       tasks,
       filters,
       totalCount,
       loading,
       updateFilters,
       searchTasks,
       moveTask,
       assignTask,
       archiveTask
     } = useTaskList();

     const handleMoveTask = async (taskId: number, columnId: number) => {
       if (!user.is_root) {
         toast.error('Only root users can move tasks');
         return;
       }
       await moveTask(taskId, columnId);
     };

     const handleAssignTask = async (taskId: number, assigneeId: number | null) => {
       if (!user.is_root) {
         toast.error('Only root users can assign tasks');
         return;
       }
       await assignTask(taskId, assigneeId);
     };

     return (
       <div className="task-list-page">
         <TaskListHeader />
         <TaskListFilters 
           filters={filters} 
           onFiltersChange={updateFilters}
         />
         <TaskListTable 
           tasks={tasks}
           canManage={user.is_root}
           onMoveTask={handleMoveTask}
           onAssignTask={handleAssignTask}
           onArchiveTask={archiveTask}
         />
         <TaskListPagination total={totalCount} />
       </div>
     );
   };
   ```

2. **Task List Filter Components**
   ```typescript
   // frontend/src/components/TaskList/TaskListFilters.tsx
   interface TaskListFiltersProps {
     filters: TaskListFilters;
     onFiltersChange: (filters: TaskListFilters) => void;
   }

   const TaskListFilters: React.FC<TaskListFiltersProps> = ({ filters, onFiltersChange }) => {
     const { users, columns } = useAppData();

     return (
       <div className="task-list-filters">
         <div className="filter-row">
           <SearchInput
             value={filters.searchText || ''}
             onChange={(searchText) => onFiltersChange({ ...filters, searchText })}
             placeholder="Search in title, content, and comments..."
           />
           
           <Select
             value={filters.assigneeId || 'all'}
             onChange={(assigneeId) => onFiltersChange({ 
               ...filters, 
               assigneeId: assigneeId === 'all' ? null : Number(assigneeId) 
             })}
             options={[
               { value: 'all', label: 'All Assignees' },
               { value: 'unassigned', label: 'Unassigned' },
               ...users.map(u => ({ value: u.id, label: u.name }))
             ]}
           />
           
           <Select
             value={filters.columnId || 'all'}
             onChange={(columnId) => onFiltersChange({ 
               ...filters, 
               columnId: columnId === 'all' ? null : Number(columnId) 
             })}
             options={[
               { value: 'all', label: 'All Columns' },
               ...columns.map(c => ({ value: c.id, label: c.title }))
             ]}
           />
         </div>

         <div className="filter-row">
           <DateRangePicker
             from={filters.dateFrom}
             to={filters.dateTo}
             onChange={(dateFrom, dateTo) => onFiltersChange({ 
               ...filters, 
               dateFrom, 
               dateTo 
             })}
           />
           
           <Select
             value={filters.priority || 'all'}
             onChange={(priority) => onFiltersChange({ 
               ...filters, 
               priority: priority === 'all' ? null : priority 
             })}
             options={[
               { value: 'all', label: 'All Priorities' },
               { value: 'low', label: 'Low' },
               { value: 'medium', label: 'Medium' },
               { value: 'high', label: 'High' },
               { value: 'urgent', label: 'Urgent' }
             ]}
           />
           
           <Checkbox
             checked={filters.includeArchived}
             onChange={(includeArchived) => onFiltersChange({ 
               ...filters, 
               includeArchived 
             })}
             label="Include Archived"
           />
         </div>
       </div>
     );
   };
   ```

3. **Task List Table Component**
   ```typescript
   // frontend/src/components/TaskList/TaskListTable.tsx
   interface TaskListTableProps {
     tasks: TaskListItem[];
     canManage: boolean;
     onMoveTask: (taskId: number, columnId: number) => void;
     onAssignTask: (taskId: number, assigneeId: number | null) => void;
     onArchiveTask: (taskId: number) => void;
   }

   const TaskListTable: React.FC<TaskListTableProps> = ({
     tasks,
     canManage,
     onMoveTask,
     onAssignTask,
     onArchiveTask
   }) => {
     const { columns, users } = useAppData();

     return (
       <div className="task-list-table">
         <table>
           <thead>
             <tr>
               <th>Title</th>
               <th>Content</th>
               <th>Column</th>
               <th>Assignee</th>
               <th>Creator</th>
               <th>Priority</th>
               <th>Comments</th>
               <th>Created</th>
               <th>Updated</th>
               {canManage && <th>Actions</th>}
             </tr>
           </thead>
           <tbody>
             {tasks.map(task => (
               <TaskListRow
                 key={task.id}
                 task={task}
                 canManage={canManage}
                 columns={columns}
                 users={users}
                 onMoveTask={onMoveTask}
                 onAssignTask={onAssignTask}
                 onArchiveTask={onArchiveTask}
               />
             ))}
           </tbody>
         </table>
       </div>
     );
   };
   ```

4. **Task List Row Component**
   ```typescript
   // frontend/src/components/TaskList/TaskListRow.tsx
   const TaskListRow: React.FC<TaskListRowProps> = ({
     task,
     canManage,
     columns,
     users,
     onMoveTask,
     onAssignTask,
     onArchiveTask
   }) => {
     const [isExpanded, setIsExpanded] = useState(false);

     return (
       <>
         <tr 
           className={`task-row ${task.status === 'archived' ? 'archived' : ''}`}
           onClick={() => setIsExpanded(!isExpanded)}
         >
           <td className="task-title">
             <div className="title-cell">
               <span className="expand-icon">
                 {isExpanded ? '▼' : '▶'}
               </span>
               {task.title}
             </div>
           </td>
           <td className="task-content">
             <div className="content-preview">
               {task.content ? task.content.substring(0, 100) + '...' : '-'}
             </div>
           </td>
           <td className="task-column">
             {canManage ? (
               <Select
                 value={task.column_id}
                 onChange={(columnId) => onMoveTask(task.id, Number(columnId))}
                 options={columns.map(c => ({ value: c.id, label: c.title }))}
               />
             ) : (
               task.column_title
             )}
           </td>
           <td className="task-assignee">
             {canManage ? (
               <Select
                 value={task.assigned_to || 'unassigned'}
                 onChange={(assigneeId) => onAssignTask(
                   task.id, 
                   assigneeId === 'unassigned' ? null : Number(assigneeId)
                 )}
                 options={[
                   { value: 'unassigned', label: 'Unassigned' },
                   ...users.map(u => ({ value: u.id, label: u.name }))
                 ]}
               />
             ) : (
               task.assigned_user_name || 'Unassigned'
             )}
           </td>
           <td className="task-creator">{task.created_by_user_name}</td>
           <td className="task-priority">
             <PriorityBadge priority={task.priority} />
           </td>
           <td className="task-comments">
             <span className="comment-count">{task.comment_count}</span>
             {task.last_comment_at && (
               <span className="last-comment">
                 Last: {formatDate(task.last_comment_at)}
               </span>
             )}
           </td>
           <td className="task-created">{formatDate(task.created_at)}</td>
           <td className="task-updated">{formatDate(task.updated_at)}</td>
           {canManage && (
             <td className="task-actions">
               <ActionDropdown
                 onArchive={() => onArchiveTask(task.id)}
                 onEdit={() => openTaskEditModal(task.id)}
                 isArchived={task.status === 'archived'}
               />
             </td>
           )}
         </tr>
         
         {isExpanded && (
           <tr className="task-details-row">
             <td colSpan={canManage ? 10 : 9}>
               <TaskDetailsExpanded 
                 task={task} 
                 canComment={true}
                 canEdit={canManage}
               />
             </td>
           </tr>
         )}
       </>
     );
   };
   ```

### Phase 4: Task Details and Comments

1. **Expanded Task Details**
   ```typescript
   // frontend/src/components/TaskList/TaskDetailsExpanded.tsx
   const TaskDetailsExpanded: React.FC<TaskDetailsExpandedProps> = ({
     task,
     canComment,
     canEdit
   }) => {
     const [comments, setComments] = useState<TaskComment[]>([]);
     const [newComment, setNewComment] = useState('');

     const handleAddComment = async () => {
       if (newComment.trim()) {
         await taskService.addComment(task.id, newComment);
         setNewComment('');
         // Refresh comments
       }
     };

     return (
       <div className="task-details-expanded">
         <div className="task-content-full">
           <h4>Description</h4>
           <p>{task.content || 'No description provided'}</p>
         </div>

         <div className="task-history">
           <h4>History</h4>
           <TaskHistoryTimeline taskId={task.id} />
         </div>

         <div className="task-comments">
           <h4>Comments ({comments.length})</h4>
           
           {canComment && (
             <div className="add-comment">
               <textarea
                 value={newComment}
                 onChange={(e) => setNewComment(e.target.value)}
                 placeholder="Add a comment..."
               />
               <button onClick={handleAddComment}>Add Comment</button>
             </div>
           )}

           <div className="comments-list">
             {comments.map(comment => (
               <TaskComment 
                 key={comment.id} 
                 comment={comment} 
                 canEdit={comment.user_id === currentUser.id}
               />
             ))}
           </div>
         </div>
       </div>
     );
   };
   ```

### Phase 5: Task List State Management

1. **Task List Hook**
   ```typescript
   // frontend/src/hooks/useTaskList.tsx
   const useTaskList = () => {
     const [tasks, setTasks] = useState<TaskListItem[]>([]);
     const [filters, setFilters] = useState<TaskListFilters>(defaultFilters);
     const [totalCount, setTotalCount] = useState(0);
     const [loading, setLoading] = useState(false);
     const [currentPage, setCurrentPage] = useState(1);
     const pageSize = 50;

     const loadTasks = useCallback(async () => {
       setLoading(true);
       try {
         const paginatedFilters = {
           ...filters,
           limit: pageSize,
           offset: (currentPage - 1) * pageSize
         };
         
         const [taskList, count] = await Promise.all([
           taskService.getTaskList(paginatedFilters),
           taskService.getTaskListCount(filters)
         ]);
         
         setTasks(taskList);
         setTotalCount(count);
       } catch (error) {
         toast.error('Failed to load tasks');
       } finally {
         setLoading(false);
       }
     }, [filters, currentPage]);

     const updateFilters = (newFilters: TaskListFilters) => {
       setFilters(newFilters);
       setCurrentPage(1); // Reset to first page
     };

     const searchTasks = async (searchText: string) => {
       updateFilters({ ...filters, searchText });
     };

     const moveTask = async (taskId: number, columnId: number) => {
       await taskService.moveTaskFromList(taskId, columnId);
       loadTasks(); // Refresh list
     };

     const assignTask = async (taskId: number, assigneeId: number | null) => {
       await taskService.assignTaskFromList(taskId, assigneeId);
       loadTasks(); // Refresh list
     };

     const archiveTask = async (taskId: number) => {
       await taskService.archiveTaskFromList(taskId);
       loadTasks(); // Refresh list
     };

     useEffect(() => {
       loadTasks();
     }, [loadTasks]);

     return {
       tasks,
       filters,
       totalCount,
       loading,
       currentPage,
       pageSize,
       updateFilters,
       searchTasks,
       moveTask,
       assignTask,
       archiveTask,
       setCurrentPage
     };
   };
   ```

## File Structure Changes

```
offline_kanban/
├── pkg/
│   ├── database/
│   │   └── task_list.go (new)
│   └── models/
│       └── task_list.go (new)
├── frontend/src/
│   ├── pages/
│   │   └── TaskList.tsx (new)
│   ├── components/
│   │   └── TaskList/ (new)
│   │       ├── TaskListFilters.tsx
│   │       ├── TaskListTable.tsx
│   │       ├── TaskListRow.tsx
│   │       ├── TaskDetailsExpanded.tsx
│   │       ├── TaskListPagination.tsx
│   │       └── TaskListHeader.tsx
│   ├── hooks/
│   │   └── useTaskList.tsx (new)
│   └── services/
│       └── taskListService.ts (new)
```

## User Experience Examples

### For Normal Users
- Can browse all tasks across all columns
- Can search and filter to find specific tasks
- Can view full task details including comments and history
- Can add comments to any task
- **Cannot** move tasks between columns (dropdowns are read-only text)
- **Cannot** assign/reassign tasks (assignment field is read-only text)
- **Cannot** archive tasks (no archive button visible)

### For Root Users  
- Has all normal user capabilities plus:
- Can change task column via dropdown in table
- Can assign/reassign tasks via dropdown in table
- Can archive tasks via action menu
- Can edit task details inline or via modal
- Has bulk operation capabilities (future)

## Search and Filter Capabilities

### Search Functionality
- **Text Search**: Searches in task title, content, and comments
- **Real-time Search**: Updates results as user types (with debouncing)
- **Highlight Matches**: Search terms are highlighted in results

### Filter Options
- **Assignee**: All, Unassigned, or specific users
- **Creator**: All or specific users  
- **Column**: All or specific columns
- **Priority**: All, Low, Medium, High, Urgent
- **Status**: Active, Completed, Archived
- **Date Range**: Created between specific dates
- **Comments**: Tasks with/without comments

### Sorting Options
- **Title** (A-Z, Z-A)
- **Created Date** (Newest first, Oldest first)
- **Updated Date** (Recently updated, Least recently updated) 
- **Assignee** (A-Z, Z-A)
- **Priority** (High to Low, Low to High)
- **Comment Count** (Most commented, Least commented)

## Success Criteria

- [ ] All users can access and view task list page
- [ ] Comprehensive search works across title, content, and comments
- [ ] Advanced filtering by all specified criteria
- [ ] Pagination works smoothly with large task lists
- [ ] Root users can manage tasks directly from list view
- [ ] Normal users see read-only interface for task management
- [ ] Comments system works seamlessly
- [ ] Task details expand/collapse cleanly
- [ ] Real-time updates when tasks change
- [ ] Export functionality for filtered task lists

## Timeline Estimation

- **Phase 1**: 3-4 days (Data layer and queries)
- **Phase 2**: 2-3 days (Backend API)
- **Phase 3**: 5-6 days (Frontend components)
- **Phase 4**: 3-4 days (Task details and comments)
- **Phase 5**: 2-3 days (State management)

**Total Estimated Time**: 15-20 days

## Phase 2 Enhancements

### Advanced List Features
- Saved search filters and custom views
- Advanced sorting options (multiple criteria)
- Task grouping by various fields (assignee, priority, due date)
- List view customization (column selection, width adjustment)

### Bulk Operations
- Multi-select tasks with checkboxes
- Bulk assignment and column movement
- Bulk priority and status updates
- Bulk export of selected tasks

### Enhanced Search
- Global search across all content
- Search highlighting and result previews
- Search history and suggestions
- Advanced filter combinations with AND/OR logic

### Reporting Features
- Task completion reports and analytics
- User productivity metrics
- Time-based task statistics
- Export reports in multiple formats (PDF, Excel, CSV)

### Integration Features
- Task import from external sources
- Automated task creation rules
- API endpoints for external integrations
- Webhook support for real-time updates

## Notes

- Task List page provides administrative overview that complements board view
- Root-only controls are clearly distinguished from read-only elements
- Search functionality is comprehensive but performant
- Pagination ensures good performance with large datasets
- Comments and history provide full context for each task
- Export capabilities support reporting and backup needs
- Phase 2 features transform the list page into a powerful task management hub