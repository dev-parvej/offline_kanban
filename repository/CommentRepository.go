package repository

import (
	"database/sql"
	"errors"
	"time"

	"github.com/dev-parvej/offline_kanban/pkg/database"
)

type Comment struct {
	ID        int       `json:"id"`
	Content   string    `json:"content"`
	TaskID    int       `json:"task_id"`
	CreatedBy int       `json:"created_by"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	
	// Joined fields from users table
	AuthorName     *string `json:"author_name,omitempty"`
	AuthorUsername string  `json:"author_username,omitempty"`
}

type CommentRepository struct {
	db *database.Database
}

func NewCommentRepository(db *database.Database) *CommentRepository {
	return &CommentRepository{
		db: db,
	}
}

// Create a new comment
func (cr *CommentRepository) Create(content string, taskID, createdBy int) (*Comment, error) {
	query := `
		INSERT INTO comments (content, task_id, created_by, created_at, updated_at)
		VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`

	result, err := cr.db.Instance().Exec(query, content, taskID, createdBy)
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	return cr.FindByID(int(id))
}

// Find comment by ID with author information
func (cr *CommentRepository) FindByID(id int) (*Comment, error) {
	comment := &Comment{}
	query := `
		SELECT c.id, c.content, c.task_id, c.created_by, c.created_at, c.updated_at,
		       u.name, u.username
		FROM comments c
		LEFT JOIN users u ON c.created_by = u.id
		WHERE c.id = ?`

	err := cr.db.Instance().QueryRow(query, id).Scan(
		&comment.ID,
		&comment.Content,
		&comment.TaskID,
		&comment.CreatedBy,
		&comment.CreatedAt,
		&comment.UpdatedAt,
		&comment.AuthorName,
		&comment.AuthorUsername,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("comment not found")
		}
		return nil, err
	}

	return comment, nil
}

// Get all comments for a task with author information
func (cr *CommentRepository) GetByTaskID(taskID int) ([]*Comment, error) {
	query := `
		SELECT c.id, c.content, c.task_id, c.created_by, c.created_at, c.updated_at,
		       u.name, u.username
		FROM comments c
		LEFT JOIN users u ON c.created_by = u.id
		WHERE c.task_id = ?
		ORDER BY c.created_at ASC`

	rows, err := cr.db.Instance().Query(query, taskID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []*Comment
	for rows.Next() {
		comment := &Comment{}
		err := rows.Scan(
			&comment.ID,
			&comment.Content,
			&comment.TaskID,
			&comment.CreatedBy,
			&comment.CreatedAt,
			&comment.UpdatedAt,
			&comment.AuthorName,
			&comment.AuthorUsername,
		)
		if err != nil {
			return nil, err
		}
		comments = append(comments, comment)
	}

	return comments, nil
}

// Update comment content
func (cr *CommentRepository) Update(id int, content string, userID int) (*Comment, error) {
	// First check if comment exists and user owns it
	existingComment, err := cr.FindByID(id)
	if err != nil {
		return nil, err
	}

	if existingComment.CreatedBy != userID {
		return nil, errors.New("unauthorized: can only update your own comments")
	}

	query := `
		UPDATE comments 
		SET content = ?, updated_at = CURRENT_TIMESTAMP
		WHERE id = ?`

	_, err = cr.db.Instance().Exec(query, content, id)
	if err != nil {
		return nil, err
	}

	return cr.FindByID(id)
}

// Delete comment (soft delete - mark as deleted or actual delete)
func (cr *CommentRepository) Delete(id int, userID int) error {
	// First check if comment exists and user owns it
	existingComment, err := cr.FindByID(id)
	if err != nil {
		return err
	}

	if existingComment.CreatedBy != userID {
		return errors.New("unauthorized: can only delete your own comments")
	}

	query := `DELETE FROM comments WHERE id = ?`
	
	result, err := cr.db.Instance().Exec(query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("comment not found")
	}

	return nil
}

// Get comment count for a task
func (cr *CommentRepository) GetCommentCount(taskID int) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM comments WHERE task_id = ?`
	
	err := cr.db.Instance().QueryRow(query, taskID).Scan(&count)
	if err != nil {
		return 0, err
	}

	return count, nil
}