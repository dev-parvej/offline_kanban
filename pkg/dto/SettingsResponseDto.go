package dto

import (
	"time"

	"github.com/dev-parvej/offline_kanban/pkg/util"
)

type SettingsResponse struct {
	ID                   int       `json:"id"`
	AppName              string    `json:"app_name"`
	AppDescription       *string   `json:"app_description"`
	DefaultTheme         string    `json:"default_theme"`
	EnableNotifications  bool      `json:"enable_notifications"`
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`
}

func NewSettingsResponse() *SettingsResponse {
	return &SettingsResponse{}
}

func (sr *SettingsResponse) FromSettings(settings map[string]any) *SettingsResponse {
	return util.FillStruct(sr, settings)
}