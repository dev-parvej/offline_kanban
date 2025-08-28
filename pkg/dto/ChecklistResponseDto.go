package dto

type ChecklistResponseDto struct {
	ID                int      `json:"id"`
	Title             string   `json:"title"`
	TaskID            int      `json:"task_id"`
	CreatedBy         int      `json:"created_by"`
	CompletedBy       *int     `json:"completed_by"`
	IsCompleted       bool     `json:"is_completed"`
	CreatedAt         string   `json:"created_at"`
	UpdatedAt         string   `json:"updated_at"`
	CreatedByUser     *UserDto `json:"created_by_user,omitempty"`
	CompletedByUser   *UserDto `json:"completed_by_user,omitempty"`
}

type ChecklistListResponseDto struct {
	Checklists []ChecklistResponseDto `json:"checklists"`
	TaskID     int                    `json:"task_id"`
	Total      int                    `json:"total"`
	Completed  int                    `json:"completed"`
}