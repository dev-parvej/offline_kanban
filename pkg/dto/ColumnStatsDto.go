package dto

type ColumnStatsDto struct {
	ColumnID    int `json:"column_id"`
	ColumnTitle string `json:"column_title"`
	TaskCount   int `json:"task_count"`
	CompletedTasks int `json:"completed_tasks,omitempty"` // If status field is added
	OverdueTasks   int `json:"overdue_tasks,omitempty"`   // Tasks past due date
}

type BoardStatsResponseDto struct {
	TotalColumns int              `json:"total_columns"`
	TotalTasks   int              `json:"total_tasks"`
	ColumnStats  []ColumnStatsDto `json:"column_stats"`
	CreatedBy    UserDto          `json:"created_by,omitempty"`
}