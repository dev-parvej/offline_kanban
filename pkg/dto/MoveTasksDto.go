package dto

type MoveTasksDto struct {
	FromColumnID int `validate:"required,gt=0" json:"from_column_id"`
	ToColumnID   int `validate:"required,gt=0" json:"to_column_id"`
}