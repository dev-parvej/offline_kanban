package dto

import (
	"github.com/dev-parvej/offline_kanban/pkg/util"
)

type LoginResponseDto struct {
	User         UserDto `json:"user"`
	AccessToken  string  `json:"access_token"`
	RefreshToken string  `json:"refresh_token"`
}

func NewLoginResponse() *LoginResponseDto {
	return &LoginResponseDto{}
}

func (loginResponse *LoginResponseDto) Create(data map[string]interface{}) *LoginResponseDto {
	return util.FillStruct(loginResponse, data)
}

type UserDto struct {
	ID          int    `json:"id"`
	UserName    string `json:"username"`
	Name        string `json:"name"`
	Designation string `json:"designation"`
	IsRoot      bool   `json:"is_root"`
	IsActive    bool   `json:"is_active"`
	CreatedAt   string `json:"created_at"`
}
