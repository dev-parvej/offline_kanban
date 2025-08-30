package dto

import "time"

// CreateCommentDto for creating new comments
type CreateCommentDto struct {
	Content string `validate:"required,lte=10000" json:"content"`
	TaskID  int    `validate:"required,gt=0" json:"task_id"`
}

// UpdateCommentDto for updating existing comments
type UpdateCommentDto struct {
	Content string `validate:"required,lte=10000" json:"content"`
}

// CommentResponseDto for API responses
type CommentResponseDto struct {
	ID         int    `json:"id"`
	Content    string `json:"content"`
	TaskID     int    `json:"task_id"`
	CreatedBy  int    `json:"created_by"`
	CreatedAt  string `json:"created_at"`
	UpdatedAt  string `json:"updated_at"`
	AuthorName string `json:"author_name"`
	AuthorUsername string `json:"author_username"`
}

// CommentListResponseDto for listing comments
type CommentListResponseDto struct {
	Comments []*CommentResponseDto `json:"comments"`
	Total    int                   `json:"total"`
}

// Helper function to create CommentResponseDto from repository Comment
func NewCommentResponseDto() *CommentResponseDto {
	return &CommentResponseDto{}
}

// Convert repository Comment to CommentResponseDto
func (dto *CommentResponseDto) FromComment(comment interface{}) *CommentResponseDto {
	// We'll handle the conversion in the controller
	return dto
}