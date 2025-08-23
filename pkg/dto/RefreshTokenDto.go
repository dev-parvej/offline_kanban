package dto

type RefreshTokenDto struct {
	RefreshToken string `validate:"required" json:"refresh_token"`
}