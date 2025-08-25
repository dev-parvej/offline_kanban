package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/dev-parvej/js_array_method"
	"github.com/dev-parvej/offline_kanban/pkg/database"
	"github.com/dev-parvej/offline_kanban/pkg/dto"
	"github.com/dev-parvej/offline_kanban/pkg/util"
)

type Column struct {
	ID        int       `json:"id"`
	Title     string    `json:"title"`
	CreatedBy int       `json:"created_by"`
	Colors    *string   `json:"colors"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Related data (loaded separately)
	CreatedByUser *User        `json:"created_by_user,omitempty"`
	TaskCount     int          `json:"task_count,omitempty"`
	Position      int          `json:"position,omitempty"`
	DeletedAt     sql.NullTime `json:"deleted_at,omitempty"`
}

type ColumnRepository struct {
	db *database.Database
}

func NewColumnRepository(db *database.Database) *ColumnRepository {
	return &ColumnRepository{
		db: db,
	}
}

// Find column by ID
func (cr *ColumnRepository) FindByID(id int) (*Column, error) {
	column := &Column{}
	query := `
		SELECT id, title, created_by, colors, created_at, updated_at, position, deleted_at
		FROM columns 
		WHERE id = ?`

	err := cr.db.Instance().QueryRow(query, id).Scan(
		&column.ID,
		&column.Title,
		&column.CreatedBy,
		&column.Colors,
		&column.CreatedAt,
		&column.UpdatedAt,
		&column.Position,
		&column.DeletedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("column not found")
		}
		return nil, err
	}

	return column, nil
}

// Find column by ID
func (cr *ColumnRepository) FindByIDs(ids []int) ([]*Column, error) {
	placeholders := strings.Repeat("?,", len(ids))
	placeholders = placeholders[:len(placeholders)-1] // remove last comma

	query := fmt.Sprintf(`SELECT id, title, created_by, colors, created_at, updated_at, position
                      FROM columns 
                      WHERE id IN (%s)`, placeholders)

	rows, err := cr.db.Instance().Query(query, util.ConvertToInterface(ids)...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return cr.scanColumns(rows)
}

// Create new column
func (cr *ColumnRepository) Create(title string, createdBy int, colors *string) (*Column, error) {
	query := `
		INSERT INTO columns (title, created_by, colors, created_at, updated_at)
		VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`

	result, err := cr.db.Instance().Exec(query, title, createdBy, colors)
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	return cr.FindByID(int(id))
}

// Update column
func (cr *ColumnRepository) Update(id int, title *string, colors *string) (*Column, error) {
	query := `
		UPDATE columns 
		SET title = COALESCE(?, title),
		    colors = ?,
		    updated_at = CURRENT_TIMESTAMP
		WHERE id = ?`

	result, err := cr.db.Instance().Exec(query, title, colors, id)
	if err != nil {
		return nil, err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return nil, err
	}

	if rowsAffected == 0 {
		return nil, errors.New("column not found")
	}

	return cr.FindByID(id)
}

func (cr *ColumnRepository) Archive(id int) error {
	query := `
		UPDATE columns
		SET deleted_at = CURRENT_TIMESTAMP
		WHERE id = ?;
	`

	result, err := cr.db.Instance().Exec(query, id)

	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("column not found")
	}

	return nil
}

func (cr *ColumnRepository) UnArchive(id int) error {
	query := `
		UPDATE columns
		SET deleted_at = NULL
		WHERE id = ?;
	`

	result, err := cr.db.Instance().Exec(query, id)

	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("column not found")
	}

	return nil
}

// Delete column (only if no tasks)
func (cr *ColumnRepository) Delete(id int) error {
	// Check if column has tasks
	hasTask, err := cr.HasTasks(id)
	if err != nil {
		return err
	}
	if hasTask {
		return errors.New("cannot delete column with existing tasks")
	}

	query := `DELETE FROM columns WHERE id = ?`

	result, err := cr.db.Instance().Exec(query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("column not found")
	}

	return nil
}

// Get all columns
func (cr *ColumnRepository) GetAll() ([]*Column, error) {
	query := `
		SELECT id, title, created_by, colors, created_at, updated_at, position
		FROM columns 
		ORDER BY created_at ASC`

	rows, err := cr.db.Instance().Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return cr.scanColumns(rows)
}

// Get columns with task counts
func (cr *ColumnRepository) GetAllWithTaskCounts(showArchived bool) ([]*Column, error) {
	query := `
		SELECT c.id, c.title, c.created_by, c.colors, c.created_at, c.updated_at,
		       COUNT(t.id) as task_count, c.position, c.deleted_at
		FROM columns c
		LEFT JOIN tasks t ON c.id = t.column_id`

	if !showArchived {
		query += ` WHERE c.deleted_at IS NULL `
	}

	query += ` GROUP BY c.id, c.title, c.created_by, c.colors, c.created_at, c.updated_at ORDER BY c.position ASC`

	rows, err := cr.db.Instance().Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	columns := make([]*Column, 0)
	for rows.Next() {
		column := &Column{}
		err := rows.Scan(
			&column.ID,
			&column.Title,
			&column.CreatedBy,
			&column.Colors,
			&column.CreatedAt,
			&column.UpdatedAt,
			&column.TaskCount,
			&column.Position,
			&column.DeletedAt,
		)
		if err != nil {
			return nil, err
		}
		columns = append(columns, column)
	}

	return columns, nil
}

// Get columns with related data (creator info)
func (cr *ColumnRepository) GetAllWithCreators() ([]*Column, error) {
	query := `
		SELECT c.id, c.title, c.created_by, c.colors, c.created_at, c.updated_at,
		       u.username as creator_username, u.name as creator_name,
		       COUNT(t.id) as task_count
		FROM columns c
		LEFT JOIN users u ON c.created_by = u.id
		LEFT JOIN tasks t ON c.id = t.column_id
		GROUP BY c.id, c.title, c.created_by, c.colors, c.created_at, c.updated_at,
		         u.username, u.name
		ORDER BY c.created_at ASC`

	rows, err := cr.db.Instance().Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var columns []*Column
	for rows.Next() {
		column := &Column{}
		var creatorUsername, creatorName sql.NullString

		err := rows.Scan(
			&column.ID,
			&column.Title,
			&column.CreatedBy,
			&column.Colors,
			&column.CreatedAt,
			&column.UpdatedAt,
			&creatorUsername,
			&creatorName,
			&column.TaskCount,
			&column.Position,
		)
		if err != nil {
			return nil, err
		}

		// Set creator data if available
		if creatorUsername.Valid {
			column.CreatedByUser = &User{
				UserName: creatorUsername.String,
				Name:     &creatorName.String,
			}
		}

		columns = append(columns, column)
	}

	return columns, nil
}

// Check if column has tasks
func (cr *ColumnRepository) HasTasks(columnID int) (bool, error) {
	var count int
	query := `SELECT COUNT(*) FROM tasks WHERE column_id = ?`

	err := cr.db.Instance().QueryRow(query, columnID).Scan(&count)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

// Get task count for column
func (cr *ColumnRepository) GetTaskCount(columnID int) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM tasks WHERE column_id = ?`

	err := cr.db.Instance().QueryRow(query, columnID).Scan(&count)
	return count, err
}

// Check if column title exists (for validation)
func (cr *ColumnRepository) TitleExists(title string, excludeID *int) (bool, error) {
	var query string
	var args []interface{}

	if excludeID != nil {
		query = `SELECT COUNT(*) FROM columns WHERE title = ? AND id != ?`
		args = []interface{}{title, *excludeID}
	} else {
		query = `SELECT COUNT(*) FROM columns WHERE title = ?`
		args = []interface{}{title}
	}

	var count int
	err := cr.db.Instance().QueryRow(query, args...).Scan(&count)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

func (cr *ColumnRepository) Reorder(columnOrders []dto.ColumnsOrder) error {
	tx, err := cr.db.Instance().Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	js_array_method.Foreach(columnOrders, func(order dto.ColumnsOrder, _ int) {
		_, err := tx.Exec(`
			UPDATE columns
			SET position = ?,
			    updated_at = CURRENT_TIMESTAMP
			WHERE id = ?`, order.Position, order.ID)
		if err != nil {
			panic(err)
		}
	})

	return tx.Commit()
}

// Move all tasks from one column to another
func (cr *ColumnRepository) MoveAllTasks(fromColumnID, toColumnID int) error {
	// Start transaction
	tx, err := cr.db.Instance().Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Get max position in destination column
	var maxPosition sql.NullInt64
	err = tx.QueryRow(`SELECT MAX(position) FROM tasks WHERE column_id = ?`, toColumnID).Scan(&maxPosition)
	if err != nil {
		return err
	}

	startPosition := 1
	if maxPosition.Valid {
		startPosition = int(maxPosition.Int64) + 1
	}

	// Move all tasks to the new column, updating their positions
	_, err = tx.Exec(`
		UPDATE tasks 
		SET column_id = ?, 
		    position = position + ?,
		    updated_at = CURRENT_TIMESTAMP
		WHERE column_id = ?`, toColumnID, startPosition-1, fromColumnID)
	if err != nil {
		return err
	}

	return tx.Commit()
}

// Get columns created by specific user
func (cr *ColumnRepository) GetByCreator(createdBy int) ([]*Column, error) {
	query := `
		SELECT id, title, created_by, colors, created_at, updated_at
		FROM columns 
		WHERE created_by = ?
		ORDER BY created_at ASC`

	rows, err := cr.db.Instance().Query(query, createdBy)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return cr.scanColumns(rows)
}

// Helper method to scan columns
func (cr *ColumnRepository) scanColumns(rows *sql.Rows) ([]*Column, error) {
	columns := make([]*Column, 0)
	for rows.Next() {
		column := &Column{}
		err := rows.Scan(
			&column.ID,
			&column.Title,
			&column.CreatedBy,
			&column.Colors,
			&column.CreatedAt,
			&column.UpdatedAt,
			&column.Position,
		)
		if err != nil {
			return nil, err
		}
		columns = append(columns, column)
	}
	return columns, nil
}
