package dto

import (
	"time"
)

type SettingsResponse struct {
	ID                  int       `json:"id"`
	AppName             string    `json:"app_name"`
	AppDescription      *string   `json:"app_description"`
	DefaultTheme        string    `json:"default_theme"`
	EnableNotifications bool      `json:"enable_notifications"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}
