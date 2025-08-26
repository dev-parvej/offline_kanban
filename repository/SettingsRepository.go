package repository

import (
	"database/sql"
	"errors"
	"time"

	"github.com/dev-parvej/offline_kanban/pkg/database"
)

type AppSettings struct {
	ID                   int       `json:"id"`
	AppName              string    `json:"app_name"`
	AppDescription       *string   `json:"app_description"`
	DefaultTheme         string    `json:"default_theme"`
	EnableNotifications  bool      `json:"enable_notifications"`
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`
}

type SettingsRepository struct {
	db *database.Database
}

func NewSettingsRepository(db *database.Database) *SettingsRepository {
	return &SettingsRepository{
		db: db,
	}
}

// Get app settings (there's only one record with ID = 1)
func (sr *SettingsRepository) GetSettings() (*AppSettings, error) {
	settings := &AppSettings{}
	query := `
		SELECT id, app_name, app_description, default_theme, enable_notifications, created_at, updated_at 
		FROM app_settings 
		WHERE id = 1`

	err := sr.db.Instance().QueryRow(query).Scan(
		&settings.ID,
		&settings.AppName,
		&settings.AppDescription,
		&settings.DefaultTheme,
		&settings.EnableNotifications,
		&settings.CreatedAt,
		&settings.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("app settings not found")
		}
		return nil, err
	}

	return settings, nil
}

// Update app settings
func (sr *SettingsRepository) UpdateSettings(appName string, appDescription *string, defaultTheme string, enableNotifications bool) (*AppSettings, error) {
	query := `
		UPDATE app_settings 
		SET app_name = ?, 
		    app_description = ?, 
		    default_theme = ?, 
		    enable_notifications = ?, 
		    updated_at = CURRENT_TIMESTAMP 
		WHERE id = 1`

	_, err := sr.db.Instance().Exec(query, appName, appDescription, defaultTheme, enableNotifications)
	if err != nil {
		return nil, err
	}

	return sr.GetSettings()
}

// Update only app name and description
func (sr *SettingsRepository) UpdateAppInfo(appName string, appDescription *string) (*AppSettings, error) {
	query := `
		UPDATE app_settings 
		SET app_name = ?, 
		    app_description = ?, 
		    updated_at = CURRENT_TIMESTAMP 
		WHERE id = 1`

	_, err := sr.db.Instance().Exec(query, appName, appDescription)
	if err != nil {
		return nil, err
	}

	return sr.GetSettings()
}

// Update only theme
func (sr *SettingsRepository) UpdateTheme(defaultTheme string) (*AppSettings, error) {
	// Validate theme value
	if defaultTheme != "light" && defaultTheme != "dark" && defaultTheme != "system" {
		return nil, errors.New("invalid theme value. Must be 'light', 'dark', or 'system'")
	}

	query := `
		UPDATE app_settings 
		SET default_theme = ?, 
		    updated_at = CURRENT_TIMESTAMP 
		WHERE id = 1`

	_, err := sr.db.Instance().Exec(query, defaultTheme)
	if err != nil {
		return nil, err
	}

	return sr.GetSettings()
}

// Update only notifications setting
func (sr *SettingsRepository) UpdateNotifications(enableNotifications bool) (*AppSettings, error) {
	query := `
		UPDATE app_settings 
		SET enable_notifications = ?, 
		    updated_at = CURRENT_TIMESTAMP 
		WHERE id = 1`

	_, err := sr.db.Instance().Exec(query, enableNotifications)
	if err != nil {
		return nil, err
	}

	return sr.GetSettings()
}

// Reset settings to default values
func (sr *SettingsRepository) ResetToDefaults() (*AppSettings, error) {
	query := `
		UPDATE app_settings 
		SET app_name = 'Offline Kanban',
		    app_description = 'A powerful offline-first Kanban board application',
		    default_theme = 'system',
		    enable_notifications = 1,
		    updated_at = CURRENT_TIMESTAMP 
		WHERE id = 1`

	_, err := sr.db.Instance().Exec(query)
	if err != nil {
		return nil, err
	}

	return sr.GetSettings()
}