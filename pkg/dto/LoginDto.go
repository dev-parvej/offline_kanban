package dto

type LoginDto struct {
	UserName string `validate:"required,lte=20,gte=3" json:"userName"`
	Password string `validate:"required,lte=20,gt=3" json:"password"`
}