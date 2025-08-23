package dto

type TaskFilterDto struct {
	Search      *string `validate:"omitempty,lte=100" json:"search"`
	ColumnID    *int    `validate:"omitempty,gt=0" json:"column_id"`
	AssignedTo  *int    `validate:"omitempty,gt=0" json:"assigned_to"`
	CreatedBy   *int    `validate:"omitempty,gt=0" json:"created_by"`
	Priority    *string `validate:"omitempty,oneof=low medium high urgent" json:"priority"`
	DueDateFrom *string `validate:"omitempty" json:"due_date_from"`     // ISO format
	DueDateTo   *string `validate:"omitempty" json:"due_date_to"`       // ISO format
	CreatedFrom *string `validate:"omitempty" json:"created_from"`      // ISO format
	CreatedTo   *string `validate:"omitempty" json:"created_to"`        // ISO format
	Page        *int    `validate:"omitempty,gt=0" json:"page"`         // Page number (1-based)
	PageSize    *int    `validate:"omitempty,gt=0,lte=100" json:"page_size"` // Items per page
	OrderBy     *string `validate:"omitempty,oneof=position created_at updated_at title due_date" json:"order_by"`
	OrderDir    *string `validate:"omitempty,oneof=asc desc" json:"order_dir"`
}