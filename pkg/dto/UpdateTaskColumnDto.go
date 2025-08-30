package dto

type UpdateTaskColumnDto struct {
	ColumnID *int `validate:"required,lte=255,gte=0" json:"column_id"`
}
