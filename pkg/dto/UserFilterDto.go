package dto

type UserFilterDto struct {
	Search   string `json:"search" validate:"omitempty,max=100"`
	IsActive string `json:"is_active" validate:"omitempty,oneof=true false"`
	IsRoot   string `json:"is_root" validate:"omitempty,oneof=true false"`
	Page     int    `json:"page" validate:"omitempty,min=1"`
	Limit    int    `json:"limit" validate:"omitempty,min=1,max=100"`
}