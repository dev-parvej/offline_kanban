package dto

type UpdateProfileDto struct {
	Name        string `validate:"omitempty,lte=100,gte=1" json:"name"`
	UserName    string `validate:"omitempty,lte=20,gte=3" json:"userName"`
	Designation string `validate:"omitempty,lte=100,gte=1" json:"designation"`
}