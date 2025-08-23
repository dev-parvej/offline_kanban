package dto

type CreateUserDto struct {
	UserName    string `validate:"required,lte=20,gte=3" json:"userName"`
	Password    string `validate:"required,lte=20,gt=3" json:"password"`
	Name        string `validate:"omitempty,lte=100,gte=1" json:"name"`
	Designation string `validate:"omitempty,lte=100,gte=1" json:"designation"`
}
