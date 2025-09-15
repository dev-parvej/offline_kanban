package repository

import (
	"database/sql"
	"errors"
	"strings"
	"time"

	"github.com/dev-parvej/offline_kanban/pkg/database"
)

type Task struct {
	ID          int        `json:"id"`
	Title       string     `json:"title"`
	Description *string    `json:"description"`
	ColumnID    int        `json:"column_id"`
	AssignedTo  *int       `json:"assigned_to"`
	CreatedBy   int        `json:"created_by"`
	DueDate     *time.Time `json:"due_date"`
	Priority    *string    `json:"priority"`
	Position    int        `json:"position"`
	Weight      int        `json:"weight"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`

	// Related data (loaded separately)
	AssignedUser  *User   `json:"assigned_user,omitempty"`
	CreatedByUser *User   `json:"created_by_user,omitempty"`
	ColumnTitle   *string `json:"column_title,omitempty"`
	CommentCount  int     `json:"comment_count,omitempty"`
}

type TaskFilters struct {
	Search      *string    `json:"search"`
	ColumnID    *int       `json:"column_id"`
	AssignedTo  *int       `json:"assigned_to"`
	CreatedBy   *int       `json:"created_by"`
	Priority    *string    `json:"priority"`
	DueDateFrom *time.Time `json:"due_date_from"`
	DueDateTo   *time.Time `json:"due_date_to"`
	CreatedFrom *time.Time `json:"created_from"`
	CreatedTo   *time.Time `json:"created_to"`
	Limit       *int       `json:"limit"`
	Offset      *int       `json:"offset"`
	OrderBy     string     `json:"order_by"`  // position, created_at, updated_at, title, due_date
	OrderDir    string     `json:"order_dir"` // asc, desc
}

type TaskRepository struct {
	db *database.Database
}

func NewTaskRepository(db *database.Database) *TaskRepository {
	return &TaskRepository{
		db: db,
	}
}

// Find task by ID
func (tr *TaskRepository) FindByID(id int) (*Task, error) {
	task := &Task{}
	query := `
		SELECT id, title, description, column_id, assigned_to, created_by, 
		       due_date, priority, position, weight, created_at, updated_at
		FROM tasks 
		WHERE id = ?`

	err := tr.db.Instance().QueryRow(query, id).Scan(
		&task.ID,
		&task.Title,
		&task.Description,
		&task.ColumnID,
		&task.AssignedTo,
		&task.CreatedBy,
		&task.DueDate,
		&task.Priority,
		&task.Position,
		&task.Weight,
		&task.CreatedAt,
		&task.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("task not found")
		}
		return nil, err
	}

	return task, nil
}

// Find task by ID
func (tr *TaskRepository) FindByIDWithRelation(id int) (*Task, error) {
	task := &Task{}
	query := `
		SELECT t.id, t.title, t.description, t.column_id, t.assigned_to, t.created_by, 
		       t.due_date, t.priority, t.position, t.weight, t.created_at, t.updated_at,
		       au.username as assigned_username, au.name as assigned_name,
		       cu.username as created_username, cu.name as created_name,
		       c.title as column_title,
		       COUNT(comm.id) as comment_count
		FROM tasks t
		LEFT JOIN users au ON t.assigned_to = au.id
		LEFT JOIN users cu ON t.created_by = cu.id
		LEFT JOIN columns c ON t.column_id = c.id
		LEFT JOIN comments comm ON t.id = comm.task_id
		WHERE t.id = ?`

	var assignedUsername, assignedName, createdUsername, createdName, columnTitle sql.NullString

	err := tr.db.Instance().QueryRow(query, id).Scan(&task.ID, &task.Title, &task.Description, &task.ColumnID,
		&task.AssignedTo, &task.CreatedBy, &task.DueDate, &task.Priority,
		&task.Position, &task.Weight, &task.CreatedAt, &task.UpdatedAt,
		&assignedUsername, &assignedName, &createdUsername, &createdName,
		&columnTitle, &task.CommentCount,
	)

	// Set related data
	if assignedUsername.Valid {
		task.AssignedUser = &User{
			UserName: assignedUsername.String,
			Name:     &assignedName.String,
		}
	}
	if createdUsername.Valid {
		task.CreatedByUser = &User{
			UserName: createdUsername.String,
			Name:     &createdName.String,
		}
	}
	if columnTitle.Valid {
		task.ColumnTitle = &columnTitle.String
	}

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("task not found")
		}
		return nil, err
	}

	return task, nil
}

// Create new task
func (tr *TaskRepository) Create(title string, description *string, columnID, createdBy int,
	assignedTo *int, dueDate *time.Time, priority *string) (*Task, error) {

	// Get next position for the column
	position, err := tr.getNextPosition(columnID)
	if err != nil {
		return nil, err
	}

	query := `
		INSERT INTO tasks (title, description, column_id, assigned_to, created_by, 
		                   due_date, priority, position, weight, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`

	result, err := tr.db.Instance().Exec(query, title, description, columnID,
		assignedTo, createdBy, dueDate, priority, position)
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	return tr.FindByID(int(id))
}

// Update task
func (tr *TaskRepository) Update(id int, title *string, description *string,
	assignedTo *int, dueDate *time.Time, priority *string) (*Task, error) {

	query := `
		UPDATE tasks 
		SET title = COALESCE(?, title),
		    description = COALESCE(?, description),
		    assigned_to = ?,
		    due_date = ?,
		    priority = COALESCE(?, priority),
		    updated_at = CURRENT_TIMESTAMP
		WHERE id = ?`

	_, err := tr.db.Instance().Exec(query, title, description, assignedTo, dueDate, priority, id)
	if err != nil {
		return nil, err
	}

	return tr.FindByID(id)
}

// Move task to different column
func (tr *TaskRepository) MoveToColumn(id, columnID, newPosition int) error {
	// Start transaction
	tx, err := tr.db.Instance().Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Update task column and position
	_, err = tx.Exec(`
		UPDATE tasks 
		SET column_id = ?, position = ?, updated_at = CURRENT_TIMESTAMP 
		WHERE id = ?`, columnID, newPosition, id)
	if err != nil {
		return err
	}

	// Reorder other tasks in the column
	_, err = tx.Exec(`
		UPDATE tasks 
		SET position = position + 1 
		WHERE column_id = ? AND position >= ? AND id != ?`,
		columnID, newPosition, id)
	if err != nil {
		return err
	}

	return tx.Commit()
}

// Delete task
func (tr *TaskRepository) Delete(id int) error {
	query := `DELETE FROM tasks WHERE id = ?`

	result, err := tr.db.Instance().Exec(query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("task not found")
	}

	return nil
}

// Get tasks by column
func (tr *TaskRepository) GetByColumn(columnID int) ([]*Task, error) {
	query := `
		SELECT id, title, description, column_id, assigned_to, created_by, 
		       due_date, priority, position, weight, created_at, updated_at
		FROM tasks 
		WHERE column_id = ?
		ORDER BY position ASC`

	rows, err := tr.db.Instance().Query(query, columnID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return tr.scanTasks(rows)
}

// Get tasks with filters
func (tr *TaskRepository) GetWithFilters(filters TaskFilters) ([]*Task, error) {
	query, args := tr.buildFilterQuery(filters, false)

	rows, err := tr.db.Instance().Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return tr.scanTasks(rows)
}

// Count tasks with filters
func (tr *TaskRepository) CountWithFilters(filters TaskFilters) (int, error) {
	query, args := tr.buildFilterQuery(filters, true)

	var count int
	err := tr.db.Instance().QueryRow(query, args...).Scan(&count)
	return count, err
}

// Get tasks with related data (joins)
func (tr *TaskRepository) GetWithRelations(filters TaskFilters) ([]*Task, error) {
	baseQuery := `
		SELECT t.id, t.title, SUBSTR(t.description, 1, 400), t.column_id, t.assigned_to, t.created_by, 
		       t.due_date, t.priority, t.position, t.weight, t.created_at, t.updated_at,
		       au.username as assigned_username, au.name as assigned_name,
		       cu.username as created_username, cu.name as created_name,
		       c.title as column_title,
		       COUNT(comm.id) as comment_count
		FROM tasks t
		LEFT JOIN users au ON t.assigned_to = au.id
		LEFT JOIN users cu ON t.created_by = cu.id
		LEFT JOIN columns c ON t.column_id = c.id
		LEFT JOIN comments comm ON t.id = comm.task_id`

	whereClause, args := tr.buildWhereClause(filters)
	if whereClause != "" {
		baseQuery += " WHERE " + whereClause
	}

	baseQuery += " GROUP BY t.id"

	// Add ordering
	orderBy := "t.position"
	orderDir := "ASC"
	if filters.OrderBy != "" {
		orderBy = "t." + filters.OrderBy
	}
	if filters.OrderDir == "desc" {
		orderDir = "DESC"
	}
	baseQuery += " ORDER BY " + orderBy + " " + orderDir

	// Add pagination
	if filters.Limit != nil {
		baseQuery += " LIMIT ?"
		args = append(args, *filters.Limit)

		if filters.Offset != nil {
			baseQuery += " OFFSET ?"
			args = append(args, *filters.Offset)
		}
	}

	rows, err := tr.db.Instance().Query(baseQuery, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tasks []*Task
	for rows.Next() {
		task := &Task{}
		var assignedUsername, assignedName, createdUsername, createdName, columnTitle sql.NullString

		err := rows.Scan(
			&task.ID, &task.Title, &task.Description, &task.ColumnID,
			&task.AssignedTo, &task.CreatedBy, &task.DueDate, &task.Priority,
			&task.Position, &task.Weight, &task.CreatedAt, &task.UpdatedAt,
			&assignedUsername, &assignedName, &createdUsername, &createdName,
			&columnTitle, &task.CommentCount,
		)
		if err != nil {
			return nil, err
		}

		// Set related data
		if assignedUsername.Valid {
			task.AssignedUser = &User{
				UserName: assignedUsername.String,
				Name:     &assignedName.String,
			}
		}
		if createdUsername.Valid {
			task.CreatedByUser = &User{
				UserName: createdUsername.String,
				Name:     &createdName.String,
			}
		}
		if columnTitle.Valid {
			task.ColumnTitle = &columnTitle.String
		}

		tasks = append(tasks, task)
	}

	return tasks, nil
}

// Helper methods
func (tr *TaskRepository) getNextPosition(columnID int) (int, error) {
	var maxPosition sql.NullInt64
	query := `SELECT MAX(position) FROM tasks WHERE column_id = ?`

	err := tr.db.Instance().QueryRow(query, columnID).Scan(&maxPosition)
	if err != nil {
		return 0, err
	}

	if maxPosition.Valid {
		return int(maxPosition.Int64) + 1, nil
	}
	return 1, nil
}

func (tr *TaskRepository) buildFilterQuery(filters TaskFilters, isCount bool) (string, []interface{}) {
	var selectClause string
	if isCount {
		selectClause = "SELECT COUNT(*) FROM tasks t"
	} else {
		selectClause = `
			SELECT t.id, t.title, t.description, t.column_id, t.assigned_to, t.created_by, 
			       t.due_date, t.priority, t.position, t.weight, t.created_at, t.updated_at
			FROM tasks t`
	}

	whereClause, args := tr.buildWhereClause(filters)
	query := selectClause
	if whereClause != "" {
		query += " WHERE " + whereClause
	}

	if !isCount {
		// Add ordering
		orderBy := "position"
		orderDir := "ASC"
		if filters.OrderBy != "" {
			orderBy = filters.OrderBy
		}
		if filters.OrderDir == "desc" {
			orderDir = "DESC"
		}
		query += " ORDER BY " + orderBy + " " + orderDir

		// Add pagination
		if filters.Limit != nil {
			query += " LIMIT ?"
			args = append(args, *filters.Limit)

			if filters.Offset != nil {
				query += " OFFSET ?"
				args = append(args, *filters.Offset)
			}
		}
	}

	return query, args
}

func (tr *TaskRepository) buildWhereClause(filters TaskFilters) (string, []interface{}) {
	var conditions []string
	var args []interface{}

	if filters.Search != nil && *filters.Search != "" {
		conditions = append(conditions, "(t.title LIKE ? OR t.description LIKE ?)")
		searchTerm := "%" + *filters.Search + "%"
		args = append(args, searchTerm, searchTerm)
	}

	if filters.ColumnID != nil {
		conditions = append(conditions, "t.column_id = ?")
		args = append(args, *filters.ColumnID)
	}

	if filters.AssignedTo != nil {
		conditions = append(conditions, "t.assigned_to = ?")
		args = append(args, *filters.AssignedTo)
	}

	if filters.CreatedBy != nil {
		conditions = append(conditions, "t.created_by = ?")
		args = append(args, *filters.CreatedBy)
	}

	if filters.Priority != nil {
		conditions = append(conditions, "t.priority = ?")
		args = append(args, *filters.Priority)
	}

	if filters.DueDateFrom != nil {
		conditions = append(conditions, "t.due_date >= ?")
		args = append(args, *filters.DueDateFrom)
	}

	if filters.DueDateTo != nil {
		conditions = append(conditions, "t.due_date <= ?")
		args = append(args, *filters.DueDateTo)
	}

	if filters.CreatedFrom != nil {
		conditions = append(conditions, "t.created_at >= ?")
		args = append(args, *filters.CreatedFrom)
	}

	if filters.CreatedTo != nil {
		conditions = append(conditions, "t.created_at <= ?")
		args = append(args, *filters.CreatedTo)
	}

	return strings.Join(conditions, " AND "), args
}

func (tr *TaskRepository) scanTasks(rows *sql.Rows) ([]*Task, error) {
	var tasks []*Task
	for rows.Next() {
		task := &Task{}
		err := rows.Scan(
			&task.ID, &task.Title, &task.Description, &task.ColumnID,
			&task.AssignedTo, &task.CreatedBy, &task.DueDate, &task.Priority,
			&task.Position, &task.Weight, &task.CreatedAt, &task.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		tasks = append(tasks, task)
	}
	return tasks, nil
}
