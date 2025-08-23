package dto

type MoveTaskDto struct {
	ColumnID    int `validate:"required,gt=0" json:"column_id"`
	NewPosition int `validate:"required,gte=0" json:"new_position"`
}