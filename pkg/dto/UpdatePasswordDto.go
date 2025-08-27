package dto

type UpdatePasswordDto struct {
	NewPassword string `validate:"required,lte=20,gt=3" json:"new_password"`
}
