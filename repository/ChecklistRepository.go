package repository

import (
	"database/sql"
	"errors"
	"time"

	"github.com/dev-parvej/offline_kanban/pkg/database"
)

type Checklist struct {
	ID          int       `json:"id"`
	Title       string    `json:"title"`
	CreatedBy   int       `json:"created_by"`
	CompletedBy *int      `json:"completed_by"`
	TaskID      int       `json:"task_id"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Related data (loaded separately)
	CreatedByUser   *User `json:"created_by_user,omitempty"`
	CompletedByUser *User `json:"completed_by_user,omitempty"`
	IsCompleted     bool  `json:"is_completed"`
}

type ChecklistRepository struct {
	db *database.Database
}

func NewChecklistRepository(db *database.Database) *ChecklistRepository {
	return &ChecklistRepository{db: db}
}

func (r *ChecklistRepository) Create(title string, taskID int, createdBy int) (*Checklist, error) {
	query := `
		INSERT INTO checklists (title, task_id, created_by, created_at, updated_at)
		VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
	`

	result, err := r.db.Instance().Exec(query, title, taskID, createdBy)
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	return r.FindByID(int(id))
}

func (r *ChecklistRepository) FindByID(id int) (*Checklist, error) {
	query := `
		SELECT 
			c.id, c.title, c.created_by, c.completed_by, c.task_id, c.created_at, c.updated_at,
			cu.id, cu.username, cu.name,
			comu.id, comu.username, comu.name
		FROM checklists c
		LEFT JOIN users cu ON c.created_by = cu.id
		LEFT JOIN users comu ON c.completed_by = comu.id
		WHERE c.id = ?
	`

	row := r.db.Instance().QueryRow(query, id)

	checklist := &Checklist{}
	var createdByUser, completedByUser User
	var (
		createdByID       sql.NullInt64
		createdByUsername sql.NullString
		createdByName     sql.NullString

		completedByID       sql.NullInt64
		completedByUsername sql.NullString
		completedByName     sql.NullString
	)

	err := row.Scan(
		&checklist.ID, &checklist.Title, &checklist.CreatedBy, &checklist.CompletedBy,
		&checklist.TaskID, &checklist.CreatedAt, &checklist.UpdatedAt,
		&createdByID, &createdByUsername, &createdByName,
		&completedByID, &completedByUsername, &completedByName,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("checklist not found")
		}
		return nil, err
	}

	// Set related user data
	if createdByID.Valid {
		createdByUser.ID = int(createdByID.Int64)
		createdByUser.UserName = createdByUsername.String
		if createdByName.Valid {
			createdByUser.Name = &createdByName.String
		}
		checklist.CreatedByUser = &createdByUser
	}

	if completedByID.Valid {
		completedByUser.ID = int(completedByID.Int64)
		completedByUser.UserName = completedByUsername.String
		if completedByName.Valid {
			completedByUser.Name = &completedByName.String
		}
		checklist.CompletedByUser = &completedByUser
	}

	checklist.IsCompleted = checklist.CompletedBy != nil

	return checklist, nil
}

func (r *ChecklistRepository) FindByTaskID(taskID int) ([]*Checklist, error) {
	query := `
		SELECT 
			c.id, c.title, c.created_by, c.completed_by, c.task_id, c.created_at, c.updated_at,
			cu.id, cu.username, cu.name,
			comu.id, comu.username, comu.name
		FROM checklists c
		LEFT JOIN users cu ON c.created_by = cu.id
		LEFT JOIN users comu ON c.completed_by = comu.id
		WHERE c.task_id = ?
		ORDER BY c.created_at ASC
	`

	rows, err := r.db.Instance().Query(query, taskID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var checklists []*Checklist

	for rows.Next() {
		checklist := &Checklist{}
		var createdByUser, completedByUser User
		var (
			createdByID       sql.NullInt64
			createdByUsername sql.NullString
			createdByName     sql.NullString

			completedByID       sql.NullInt64
			completedByUsername sql.NullString
			completedByName     sql.NullString
		)

		err := rows.Scan(
			&checklist.ID, &checklist.Title, &checklist.CreatedBy, &checklist.CompletedBy,
			&checklist.TaskID, &checklist.CreatedAt, &checklist.UpdatedAt,
			&createdByID, &createdByUsername, &createdByName,
			&completedByID, &completedByUsername, &completedByName,
		)

		if err != nil {
			return nil, err
		}

		// Set related user data
		if createdByID.Valid {
			createdByUser.ID = int(createdByID.Int64)
			createdByUser.UserName = createdByUsername.String
			if createdByName.Valid {
				createdByUser.Name = &createdByName.String
			}
			checklist.CreatedByUser = &createdByUser
		}

		if completedByID.Valid {
			completedByUser.ID = int(completedByID.Int64)
			completedByUser.UserName = completedByUsername.String
			if completedByName.Valid {
				completedByUser.Name = &completedByName.String
			}
			checklist.CompletedByUser = &completedByUser
		}

		checklist.IsCompleted = checklist.CompletedBy != nil
		checklists = append(checklists, checklist)
	}

	return checklists, nil
}

func (r *ChecklistRepository) Update(id int, title string) (*Checklist, error) {
	query := `
		UPDATE checklists 
		SET title = ?, updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`

	_, err := r.db.Instance().Exec(query, title, id)
	if err != nil {
		return nil, err
	}

	return r.FindByID(id)
}

func (r *ChecklistRepository) ToggleComplete(id int, userID int, completed bool) (*Checklist, error) {
	var query string
	var args []interface{}

	if completed {
		query = `
			UPDATE checklists 
			SET completed_by = ?, updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
		`
		args = []interface{}{userID, id}
	} else {
		query = `
			UPDATE checklists 
			SET completed_by = NULL, updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
		`
		args = []interface{}{id}
	}

	_, err := r.db.Instance().Exec(query, args...)
	if err != nil {
		return nil, err
	}

	return r.FindByID(id)
}

func (r *ChecklistRepository) Delete(id int) error {
	query := `DELETE FROM checklists WHERE id = ?`

	result, err := r.db.Instance().Exec(query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("checklist not found")
	}

	return nil
}
