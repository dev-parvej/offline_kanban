package dto

type UpdateUserDto struct {
	Name        *string `validate:"omitempty,lte=100,gte=1" json:"name"`
	Designation *string `validate:"omitempty,lte=100,gte=1" json:"designation"`
	UserName    *string `validate:"omitempty,lte=20,gte=3" json:"userName"`
	IsRoot      bool    `validate:"omitempty" json:"is_root"`
}
