package dto

type ColumnResponseDto struct {
	ID        int     `json:"id"`
	Title     string  `json:"title"`
	CreatedBy int     `json:"created_by"`
	Colors    *string `json:"colors"`
	CreatedAt string  `json:"created_at"` // ISO format
	UpdatedAt string  `json:"updated_at"` // ISO format
	
	// Related data (when included)
	CreatedByUser *UserDto `json:"created_by_user,omitempty"`
	TaskCount     int      `json:"task_count,omitempty"`
}

type ColumnListResponseDto struct {
	Columns []ColumnResponseDto `json:"columns"`
	Total   int                 `json:"total"`
}

type ColumnWithTasksResponseDto struct {
	Column ColumnResponseDto `json:"column"`
	Tasks  []TaskResponseDto `json:"tasks"`
}