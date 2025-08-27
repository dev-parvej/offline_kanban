package dto

import (
	"time"

	"github.com/dev-parvej/offline_kanban/pkg/util"
)

type UserResponse struct {
	ID          int       `json:"id"`
	UserName    string    `json:"username"`
	Name        *string   `json:"name"`
	Designation *string   `json:"designation"`
	IsRoot      bool      `json:"is_root"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func NewUserResponse() *UserResponse {
	return &UserResponse{}
}

func (userResponse *UserResponse) Create(data interface{}) *UserResponse {
	util.FillStruct(&userResponse, data)
	return userResponse
}
