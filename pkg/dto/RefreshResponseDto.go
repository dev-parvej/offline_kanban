package dto

import "github.com/dev-parvej/offline_kanban/pkg/util"

type RefreshResponseDto struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token,omitempty"` // Optional new refresh token
}

func NewRefreshTokenResponse() *RefreshResponseDto {
	return &RefreshResponseDto{}
}

func (refreshToken *RefreshResponseDto) Create(data map[string]interface{}) *RefreshResponseDto {
	util.FillStruct(&refreshToken, data)
	return refreshToken
}
