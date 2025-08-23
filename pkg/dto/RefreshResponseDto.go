package dto

type RefreshResponseDto struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token,omitempty"` // Optional new refresh token
}