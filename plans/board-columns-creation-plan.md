# Board Columns Creation and Management Plan

## Overview
This document outlines the plan for implementing dynamic board column creation and management in the Offline Kanban Desktop App. Only root users can create, alter, or archive columns. Columns use a linked-list approach for ordering with `before_column_id` and `after_column_id` relationships.

## Current Implementation Analysis

Currently, board columns are hardcoded in the frontend (`frontend/src/App.tsx:26-54`):
- `col-1`: "To Do"
- `col-2`: "In Progress" 
- `col-3`: "Done"

The structure uses a parent-child relationship with a root container, but columns are not persisted in the database.

## Database Schema Design

### Board Columns Table
```sql
CREATE TABLE IF NOT EXISTS board_columns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,                        -- Column title (e.g., "To Do", "In Progress")
    description TEXT,                           -- Optional column description
    color TEXT DEFAULT '#6B7280',              -- Column header color (hex)
    before_column_id INTEGER,                   -- Reference to column that comes before this one
    after_column_id INTEGER,                    -- Reference to column that comes after this one
    is_archived BOOLEAN NOT NULL DEFAULT 0,    -- Archive status (archived columns don't show on board)
    created_by INTEGER NOT NULL,               -- User ID who created the column
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (before_column_id) REFERENCES board_columns(id),
    FOREIGN KEY (after_column_id) REFERENCES board_columns(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    
    -- Ensure no column points to itself
    CHECK (before_column_id != id),
    CHECK (after_column_id != id),
    
    -- Ensure a column doesn't have both before and after pointing to the same column
    CHECK (before_column_id != after_column_id OR (before_column_id IS NULL OR after_column_id IS NULL))
);
```

### Column Position Validation Rules

1. **First Column**: `before_column_id IS NULL` and `after_column_id` points to second column
2. **Last Column**: `after_column_id IS NULL` and `before_column_id` points to previous column  
3. **Middle Columns**: Both `before_column_id` and `after_column_id` are set
4. **Single Column**: Both `before_column_id` and `after_column_id` are `NULL`
5. **Consistency**: If Column A has `after_column_id = B`, then Column B must have `before_column_id = A`

## Column Permissions Matrix

| Action | Root User | Normal User |
|--------|-----------|-------------|
| Create columns | ✅ Yes | ❌ No |
| Edit column title/description/color | ✅ Yes | ❌ No |
| Reorder columns | ✅ Yes | ❌ No |
| Archive columns | ✅ Yes | ❌ No |
| View archived columns | ✅ Yes | ❌ No |
| Delete columns | ❌ No (Nobody) | ❌ No |
| Move tasks between columns | ✅ Yes | ✅ Yes |

## Implementation Plan

### Phase 1: Database Implementation

1. **Create Migration**
   ```go
   // pkg/database/migrations/001_create_board_columns.go
   func CreateBoardColumnsTable(db *sql.DB) error
   ```

2. **Seed Default Columns**
   ```go
   // Insert default columns: "To Do", "In Progress", "Done"
   func SeedDefaultColumns(db *sql.DB, rootUserId int) error
   ```

3. **Column Database Operations**
   ```go
   // pkg/database/columns.go
   type Column struct {
       ID              int       `json:"id"`
       Title           string    `json:"title"`
       Description     *string   `json:"description"`
       Color           string    `json:"color"`
       BeforeColumnID  *int      `json:"before_column_id"`
       AfterColumnID   *int      `json:"after_column_id"`
       IsArchived      bool      `json:"is_archived"`
       CreatedBy       int       `json:"created_by"`
       CreatedAt       time.Time `json:"created_at"`
       UpdatedAt       time.Time `json:"updated_at"`
   }

   func (d *Database) CreateColumn(column *Column) error
   func (d *Database) UpdateColumn(id int, updates map[string]interface{}) error
   func (d *Database) ArchiveColumn(id int) error
   func (d *Database) GetActiveColumns() ([]*Column, error)
   func (d *Database) GetArchivedColumns() ([]*Column, error)
   func (d *Database) ReorderColumns(columnId int, newPosition ColumnPosition) error
   func (d *Database) ValidateColumnOrder(columns []*Column) error
   ```

### Phase 2: Position Management System

1. **Column Position Types**
   ```go
   type ColumnPosition struct {
       Position     string `json:"position"`      // "first", "last", "before", "after"
       ReferenceID  *int   `json:"reference_id"`  // Column ID for "before"/"after" positions
   }
   ```

2. **Position Validation Functions**
   ```go
   func ValidateColumnPositions(columns []*Column) error
   func GetColumnOrder(columns []*Column) ([]*Column, error) 
   func InsertColumnAtPosition(columns []*Column, newColumn *Column, position ColumnPosition) error
   ```

3. **Position Update Logic**
   - When inserting at "first": Set new column's `before_column_id = NULL`, update current first column's `before_column_id` 
   - When inserting at "last": Set new column's `after_column_id = NULL`, update current last column's `after_column_id`
   - When inserting "before" existing: Update surrounding columns' relationships
   - When inserting "after" existing: Update surrounding columns' relationships

### Phase 3: Backend API Implementation

1. **Column Management Methods in `app.go`**
   ```go
   func (a *App) CreateColumn(title, description, color string, position ColumnPosition) error
   func (a *App) UpdateColumn(id int, title, description, color string) error
   func (a *App) ArchiveColumn(id int) error
   func (a *App) ReorderColumn(id int, position ColumnPosition) error
   func (a *App) GetColumns(includeArchived bool) ([]*Column, error)
   func (a *App) GetColumnOrder() ([]*Column, error)
   ```

2. **Permission Middleware**
   ```go
   func (a *App) requireRootUser(username string) error
   ```

### Phase 4: Frontend Implementation

1. **Column Management Components**
   ```typescript
   // frontend/src/components/ColumnManagement/
   - ColumnManager.tsx          // Main column management interface
   - CreateColumnModal.tsx      // Create new column modal
   - EditColumnModal.tsx        // Edit existing column modal  
   - ColumnList.tsx            // List all columns with archive filter
   - ColumnCard.tsx            // Individual column display
   - ColumnReorderDialog.tsx   // Reorder columns interface
   ```

2. **Column Management Hooks**
   ```typescript
   // frontend/src/hooks/useColumns.tsx
   const useColumns = () => {
     const [columns, setColumns] = useState<Column[]>([]);
     const [archivedColumns, setArchivedColumns] = useState<Column[]>([]);
     
     const createColumn = async (data: CreateColumnData) => {};
     const updateColumn = async (id: number, data: UpdateColumnData) => {};
     const archiveColumn = async (id: number) => {};
     const reorderColumn = async (id: number, position: ColumnPosition) => {};
     const refreshColumns = async () => {};
     
     return { columns, archivedColumns, createColumn, updateColumn, archiveColumn, reorderColumn };
   };
   ```

3. **Updated Board Component**
   ```typescript
   // Update App.tsx to use dynamic columns from database
   const [boardColumns, setBoardColumns] = useState<Column[]>([]);
   
   // Load columns on app start
   useEffect(() => {
     loadColumnsFromDatabase();
   }, []);
   ```

### Phase 5: Column Management UI

1. **Column Management Interface**
   - Accessible from main navigation (root users only)
   - Tab-based interface: "Active Columns" | "Archived Columns"
   - Drag-and-drop column reordering
   - Color picker for column headers
   - Search and filter functionality

2. **Column Operations**
   - **Create**: Modal with title, description, color, and position selection
   - **Edit**: In-place editing or modal for title, description, color
   - **Archive**: Confirmation dialog with warning about tasks in column
   - **Reorder**: Drag-and-drop or dropdown position selector

3. **Board Integration**
   - Dynamic column rendering based on database
   - Column headers show color and title from database
   - Archive functionality integrated into column headers
   - Real-time updates when columns are modified

### Phase 6: Task Integration

1. **Update Tasks Table**
   ```sql
   ALTER TABLE tasks ADD COLUMN column_id INTEGER REFERENCES board_columns(id);
   ```

2. **Handle Column Archive**
   - When archiving column with tasks, move tasks to "To Do" or prompt user
   - Prevent archiving if column contains tasks (configurable)
   - Show warning with task count before archiving

3. **Task Movement Validation**
   - Ensure tasks can only be moved to active (non-archived) columns
   - Update task's `column_id` when moved between columns

## File Structure Changes

```
offline_kanban/
├── pkg/
│   ├── database/
│   │   ├── migrations/
│   │   │   └── 001_create_board_columns.go (new)
│   │   ├── columns.go (new)
│   │   └── database.go (updated)
│   └── models/
│       └── column.go (new)
├── frontend/src/
│   ├── components/
│   │   └── ColumnManagement/ (new)
│   │       ├── ColumnManager.tsx
│   │       ├── CreateColumnModal.tsx
│   │       ├── EditColumnModal.tsx
│   │       ├── ColumnList.tsx
│   │       ├── ColumnCard.tsx
│   │       └── ColumnReorderDialog.tsx
│   ├── hooks/
│   │   └── useColumns.tsx (new)
│   ├── types/
│   │   └── column.ts (new)
│   └── services/
│       └── columnService.ts (new)
```

## Validation Examples

### Valid Column Configurations
```
Single Column:
Col-1: before=NULL, after=NULL

Two Columns:
Col-1: before=NULL, after=2
Col-2: before=1, after=NULL

Three Columns:
Col-1: before=NULL, after=2
Col-2: before=1, after=3  
Col-3: before=2, after=NULL
```

### Invalid Configurations (Should be prevented)
```
Circular Reference:
Col-1: before=NULL, after=2
Col-2: before=3, after=NULL
Col-3: before=2, after=1  // Creates cycle

Orphaned Column:
Col-1: before=NULL, after=2
Col-2: before=1, after=NULL
Col-3: before=99, after=NULL  // before_column_id=99 doesn't exist

Conflicting References:
Col-1: before=NULL, after=2
Col-2: before=3, after=NULL   // Col-2 says it's after Col-3
Col-3: before=1, after=NULL   // But Col-1 says Col-2 comes after it
```

## Testing Strategy

### Database Tests
- Column CRUD operations
- Position validation logic
- Archive/unarchive functionality
- Migration and seeding tests

### Backend API Tests  
- Permission validation (root user only)
- Column ordering consistency
- Error handling for invalid positions
- Archive column with tasks scenarios

### Frontend Tests
- Column management UI components
- Drag-and-drop reordering
- Real-time column updates
- Role-based UI rendering

## Migration Strategy

1. **Create Columns Table**: Run migration to create board_columns table
2. **Seed Default Columns**: Insert current hardcoded columns (To Do, In Progress, Done)
3. **Update Frontend**: Gradually replace hardcoded columns with database-driven columns
4. **Task Integration**: Update tasks to reference column_id instead of hardcoded column names

## Success Criteria

- [ ] Root users can create custom columns with titles, descriptions, and colors
- [ ] Root users can reorder columns using before/after relationships
- [ ] Root users can archive columns (columns disappear from board but remain in system)
- [ ] Normal users cannot access column management features
- [ ] Column ordering is consistent and validated
- [ ] No column can be permanently deleted
- [ ] Board dynamically renders columns from database
- [ ] Column archive/unarchive works correctly
- [ ] Position conflicts are prevented and validated

## Timeline Estimation

- **Phase 1**: 3-4 days (Database schema and operations)
- **Phase 2**: 2-3 days (Position management system)
- **Phase 3**: 3-4 days (Backend API implementation)
- **Phase 4**: 4-5 days (Frontend components)
- **Phase 5**: 3-4 days (UI/UX for column management)
- **Phase 6**: 2-3 days (Task integration)

**Total Estimated Time**: 17-23 days

## Phase 2 Enhancements

### Advanced Column Features
- Column templates for quick setup of common board layouts
- Column-specific task limits (WIP limits) with visual indicators
- Column automation rules (auto-move tasks based on conditions)
- Column analytics and metrics (throughput, cycle time)

### Board Management
- Multiple board support with column templates
- Board-level permissions and access controls
- Column grouping and swim lanes
- Board themes and advanced styling options

### Column Workflow Features
- Column-specific task templates
- Custom column transitions and rules
- Column-based notifications and alerts
- Column performance tracking

## Notes

- Column deletion is permanently disabled to maintain data integrity
- Archive functionality provides soft-delete behavior
- Position validation prevents circular references and orphaned columns
- Color customization enhances visual organization
- Real-time updates ensure all users see column changes immediately
- Phase 2 features add advanced workflow management capabilities