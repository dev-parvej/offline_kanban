package dto

type LogoutDto struct {
	RefreshToken string `validate:"required" json:"refresh_token"`
}