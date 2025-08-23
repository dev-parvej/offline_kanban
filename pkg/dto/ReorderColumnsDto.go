package dto

type ReorderColumnsDto struct {
	ColumnIDs []int `validate:"required,min=1,dive,gt=0" json:"column_ids"`
}