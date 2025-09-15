package dto

type CreateChecklistDto struct {
	Title  string `json:"title" validate:"required,min=1,max=200"`
	TaskID int    `json:"task_id" validate:"required,min=1"`
}