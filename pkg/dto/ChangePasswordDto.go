package dto

type ChangePasswordDto struct {
	CurrentPassword string `validate:"required,lte=20,gt=3" json:"current_password"`
	NewPassword     string `validate:"required,lte=20,gt=3" json:"new_password"`
}