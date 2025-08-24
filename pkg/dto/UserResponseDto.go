package dto

import (
	"time"

	"github.com/dev-parvej/offline_kanban/repository"
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

func (ur *UserResponse) FromUser(user *repository.User) *UserResponse {
	ur.ID = user.ID
	ur.UserName = user.UserName
	ur.Name = user.Name
	ur.Designation = user.Designation
	ur.IsRoot = user.IsRoot
	ur.IsActive = user.IsActive
	ur.CreatedAt = user.CreatedAt
	ur.UpdatedAt = user.UpdatedAt
	return ur
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

func (ulr *UsersListResponse) FromUsers(users []*repository.User) *UsersListResponse {
	ulr.Total = len(users)
	for _, user := range users {
		userResp := NewUserResponse().FromUser(user)
		ulr.Users = append(ulr.Users, *userResp)
	}
	return ulr
}