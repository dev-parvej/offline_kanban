package dto

type UpdateChecklistDto struct {
	Title string `json:"title" validate:"required,min=1,max=200"`
}