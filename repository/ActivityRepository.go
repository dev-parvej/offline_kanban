package repository

import (
	"time"

	"github.com/dev-parvej/offline_kanban/pkg/database"
)

type Activity struct {
	ID         int       `json:"id"`
	EntityType string    `json:"entity_type"`
	EntityID   int       `json:"entity_id"`
	Action     string    `json:"action"`
	FieldName  *string   `json:"field_name"`
	OldValue   *string   `json:"old_value"`
	NewValue   *string   `json:"new_value"`
	UserID     int       `json:"user_id"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	UserName   *string   `json:"user_name"`
	Username   string    `json:"username"`
}

type ActivityRepository struct {
	db *database.Database
}

func NewActivityRepository(db *database.Database) *ActivityRepository {
	return &ActivityRepository{
		db: db,
	}
}

// Create a new activity record
func (ar *ActivityRepository) Create(entityType string, entityID int, action string, fieldName, oldValue, newValue *string, userID int) (*Activity, error) {
	query := `
		INSERT INTO activities (entity_type, entity_id, action, field_name, old_value, new_value, user_id, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
	`

	result, err := ar.db.Instance().Exec(query, entityType, entityID, action, fieldName, oldValue, newValue, userID)
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	return ar.FindByID(int(id))
}

// Find activity by ID with user information
func (ar *ActivityRepository) FindByID(id int) (*Activity, error) {
	query := `
		SELECT 
			a.id, a.entity_type, a.entity_id, a.action, a.field_name, 
			a.old_value, a.new_value, a.user_id, a.created_at, a.updated_at,
			u.name, u.username
		FROM activities a
		LEFT JOIN users u ON a.user_id = u.id
		WHERE a.id = ?
	`

	row := ar.db.Instance().QueryRow(query, id)
	activity := &Activity{}

	err := row.Scan(
		&activity.ID, &activity.EntityType, &activity.EntityID, &activity.Action,
		&activity.FieldName, &activity.OldValue, &activity.NewValue, &activity.UserID,
		&activity.CreatedAt, &activity.UpdatedAt, &activity.UserName, &activity.Username,
	)

	if err != nil {
		return nil, err
	}

	return activity, nil
}

// Get activities by entity (e.g., task activities)
func (ar *ActivityRepository) GetByEntity(entityType string, entityID int) ([]*Activity, error) {
	query := `
		SELECT 
			a.id, a.entity_type, a.entity_id, a.action, a.field_name, 
			a.old_value, a.new_value, a.user_id, a.created_at, a.updated_at,
			u.name, u.username
		FROM activities a
		LEFT JOIN users u ON a.user_id = u.id
		WHERE a.entity_type = ? AND a.entity_id = ?
		ORDER BY a.created_at DESC
	`

	rows, err := ar.db.Instance().Query(query, entityType, entityID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var activities []*Activity
	for rows.Next() {
		activity := &Activity{}
		err := rows.Scan(
			&activity.ID, &activity.EntityType, &activity.EntityID, &activity.Action,
			&activity.FieldName, &activity.OldValue, &activity.NewValue, &activity.UserID,
			&activity.CreatedAt, &activity.UpdatedAt, &activity.UserName, &activity.Username,
		)
		if err != nil {
			return nil, err
		}
		activities = append(activities, activity)
	}

	return activities, nil
}

// Get recent activities with pagination
func (ar *ActivityRepository) GetRecent(limit, offset int) ([]*Activity, error) {
	query := `
		SELECT 
			a.id, a.entity_type, a.entity_id, a.action, a.field_name, 
			a.old_value, a.new_value, a.user_id, a.created_at, a.updated_at,
			u.name, u.username
		FROM activities a
		LEFT JOIN users u ON a.user_id = u.id
		ORDER BY a.created_at DESC
		LIMIT ? OFFSET ?
	`

	rows, err := ar.db.Instance().Query(query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var activities []*Activity
	for rows.Next() {
		activity := &Activity{}
		err := rows.Scan(
			&activity.ID, &activity.EntityType, &activity.EntityID, &activity.Action,
			&activity.FieldName, &activity.OldValue, &activity.NewValue, &activity.UserID,
			&activity.CreatedAt, &activity.UpdatedAt, &activity.UserName, &activity.Username,
		)
		if err != nil {
			return nil, err
		}
		activities = append(activities, activity)
	}

	return activities, nil
}

// Delete activities older than specified days
func (ar *ActivityRepository) DeleteOlderThan(days int) error {
	query := `
		DELETE FROM activities 
		WHERE created_at < datetime('now', '-' || ? || ' days')
	`

	_, err := ar.db.Instance().Exec(query, days)
	return err
}

// Helper methods for common activity types

// Record task creation
func (ar *ActivityRepository) RecordTaskCreated(taskID, userID int, taskTitle string) error {
	_, err := ar.Create("task", taskID, "created", nil, nil, &taskTitle, userID)
	return err
}

// Record task update
func (ar *ActivityRepository) RecordTaskUpdate(taskID, userID int, fieldName, oldValue, newValue string) error {
	_, err := ar.Create("task", taskID, "updated", &fieldName, &oldValue, &newValue, userID)
	return err
}

// Record task deletion
func (ar *ActivityRepository) RecordTaskDeleted(taskID, userID int, taskTitle string) error {
	_, err := ar.Create("task", taskID, "deleted", nil, &taskTitle, nil, userID)
	return err
}

// Record task moved to different column
func (ar *ActivityRepository) RecordTaskMoved(taskID, userID int, oldColumn string, newColumn string) error {
	_, err := ar.Create("task", taskID, "moved", stringPtr("column"), &oldColumn, &newColumn, userID)
	return err
}

// Record task assignment change
func (ar *ActivityRepository) RecordTaskAssigned(taskID, userID int, oldAssignee, newAssignee string) error {
	_, err := ar.Create("task", taskID, "assigned", stringPtr("assignee"), &oldAssignee, &newAssignee, userID)
	return err
}

// Record task priority change
func (ar *ActivityRepository) RecordTaskPriorityChanged(taskID, userID int, oldPriority, newPriority string) error {
	_, err := ar.Create("task", taskID, "priority_changed", stringPtr("priority"), &oldPriority, &newPriority, userID)
	return err
}

// Record comment creation
func (ar *ActivityRepository) RecordCommentCreated(taskID, userID int) error {
	_, err := ar.Create("task", taskID, "commented", nil, nil, nil, userID)
	return err
}

// Helper function to convert string to *string
func stringPtr(s string) *string {
	return &s
}
