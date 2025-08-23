package dto

type TaskResponseDto struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	Description *string `json:"description"`
	ColumnID    int    `json:"column_id"`
	AssignedTo  *int   `json:"assigned_to"`
	CreatedBy   int    `json:"created_by"`
	DueDate     *string `json:"due_date"`     // ISO format
	Priority    *string `json:"priority"`
	Position    int    `json:"position"`
	Weight      int    `json:"weight"`
	CreatedAt   string `json:"created_at"`   // ISO format
	UpdatedAt   string `json:"updated_at"`   // ISO format
	
	// Related data (when included)
	AssignedUser  *UserDto `json:"assigned_user,omitempty"`
	CreatedByUser *UserDto `json:"created_by_user,omitempty"`
	ColumnTitle   *string  `json:"column_title,omitempty"`
	CommentCount  int      `json:"comment_count,omitempty"`
}

type TaskListResponseDto struct {
	Tasks      []TaskResponseDto `json:"tasks"`
	Total      int              `json:"total"`
	Page       int              `json:"page"`
	PageSize   int              `json:"page_size"`
	TotalPages int              `json:"total_pages"`
}