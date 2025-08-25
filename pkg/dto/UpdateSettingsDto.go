package dto

type UpdateSettingsDto struct {
	AppName              string `validate:"required,lte=50,gte=2" json:"app_name"`
	AppDescription       *string `validate:"omitempty,lte=200" json:"app_description"`
	DefaultTheme         string `validate:"required,oneof=light dark system" json:"default_theme"`
	EnableNotifications  bool   `json:"enable_notifications"`
}