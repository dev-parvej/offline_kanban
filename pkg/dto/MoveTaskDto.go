package dto

type MoveTaskDto struct {
	ColumnID    int `validate:"required,gt=0" json:"column_id"`
	NewPosition int `json:"new_position"`
}
