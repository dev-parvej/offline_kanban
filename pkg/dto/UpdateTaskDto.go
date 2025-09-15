package dto

type UpdateTaskDto struct {
	Title       *string `validate:"omitempty,lte=255,gte=3" json:"title"`
	Description *string `validate:"omitempty" json:"description"`
	AssignedTo  *int    `validate:"omitempty,gt=0" json:"assigned_to"`
	DueDate     *string `validate:"omitempty" json:"due_date"` // ISO format: 2024-01-15T10:30:00Z
	Priority    *string `validate:"omitempty,oneof=low medium high urgent" json:"priority"`
	ColumnID    *int    `validate:"omitempty,gt=0" json:"column_id"`
}
