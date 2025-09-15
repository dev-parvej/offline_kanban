package service

import (
	"fmt"

	"github.com/dev-parvej/offline_kanban/pkg/database"
	"github.com/dev-parvej/offline_kanban/repository"
)

type CommentService struct {
	commentRepository  *repository.CommentRepository
	activityRepository *repository.ActivityRepository
}

func NewCommentService(db *database.Database) *CommentService {
	return &CommentService{
		commentRepository:  repository.NewCommentRepository(db),
		activityRepository: repository.NewActivityRepository(db),
	}
}

// CreateComment creates a new comment and records the activity
func (cs *CommentService) CreateComment(content string, taskID, userID int) (*repository.Comment, error) {
	// Create the comment
	comment, err := cs.commentRepository.Create(content, taskID, userID)
	if err != nil {
		return nil, err
	}

	// Record comment creation activity
	err = cs.activityRepository.RecordCommentCreated(taskID, userID)
	if err != nil {
		fmt.Printf("Failed to record comment creation activity: %v\n", err)
	}

	return comment, nil
}

// UpdateComment updates a comment (no activity tracking needed for content changes)
func (cs *CommentService) UpdateComment(commentID int, content string, userID int) (*repository.Comment, error) {
	return cs.commentRepository.Update(commentID, content, userID)
}

// DeleteComment deletes a comment (no activity tracking needed)
func (cs *CommentService) DeleteComment(commentID, userID int) error {
	return cs.commentRepository.Delete(commentID, userID)
}