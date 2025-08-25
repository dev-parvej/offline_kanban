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

func (ur *UserResponse) FromUser(user map[string]any) *UserResponse {
	return util.FillStruct(ur, user)
}

type UsersListResponse struct {
	Users []UserResponse `json:"users"`
	Total int            `json:"total"`
}

func NewUsersListResponse() *UsersListResponse {
	return &UsersListResponse{
		Users: make([]UserResponse, 0),
	}
}

func (ulr *UsersListResponse) FromUsers(users []map[string]interface{}) *UsersListResponse {
	ulr.Total = len(users)
	for _, user := range users {
		userResp := NewUserResponse().FromUser(user)
		ulr.Users = append(ulr.Users, *userResp)
	}
	return ulr
}
