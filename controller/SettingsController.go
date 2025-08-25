package controller

import (
	"net/http"

	"github.com/dev-parvej/offline_kanban/middleware"
	"github.com/dev-parvej/offline_kanban/pkg/database"
	"github.com/dev-parvej/offline_kanban/pkg/dto"
	"github.com/dev-parvej/offline_kanban/pkg/util"
	"github.com/dev-parvej/offline_kanban/repository"
	"github.com/gorilla/mux"
)

type Settings struct {
	router             *mux.Router
	settingsRepository *repository.SettingsRepository
	db                 *database.Database
}

func SettingsController(router *mux.Router, db *database.Database) *Settings {
	return &Settings{
		router:             router,
		settingsRepository: repository.NewSettingsRepository(db),
		db:                 db,
	}
}

func (s *Settings) Router() {
	// Settings routes
	settingsRouter := s.router.PathPrefix("/settings").Subrouter()
	
	// Public read access for settings
	settingsRouter.HandleFunc("", s.getSettings).Methods("GET")
	
	// Admin-only route for updating settings
	settingsRouter.HandleFunc("", s.updateSettings).Methods("PUT")
	settingsRouter.Use(middleware.Authenticate)
	settingsRouter.Use(middleware.RequireRoot(s.db))
}

// Get application settings (public access)
func (s *Settings) getSettings(w http.ResponseWriter, r *http.Request) {
	settings, err := s.settingsRepository.GetSettings()
	if err != nil {
		util.Res.Writer(w).Status(500).Data(err.Error())
		return
	}

	response := dto.NewSettingsResponse().FromSettings(util.StructToMap(settings))
	util.Res.Writer(w).Status().Data(map[string]*dto.SettingsResponse{
		"settings": response,
	})
}

// Update all settings (admin only)
func (s *Settings) updateSettings(w http.ResponseWriter, r *http.Request) {
	updateSettingsDto, errors := util.ValidateRequest(r, dto.UpdateSettingsDto{})
	if errors != nil {
		util.Res.Writer(w).Status422().Data(errors.Error())
		return
	}

	// Validate theme
	if !isValidTheme(updateSettingsDto.DefaultTheme) {
		util.Res.Writer(w).Status(400).Data("Invalid theme value. Must be 'light', 'dark', or 'system'")
		return
	}

	settings, err := s.settingsRepository.UpdateSettings(
		updateSettingsDto.AppName,
		updateSettingsDto.AppDescription,
		updateSettingsDto.DefaultTheme,
		updateSettingsDto.EnableNotifications,
	)

	if err != nil {
		util.Res.Writer(w).Status(500).Data(err.Error())
		return
	}

	response := dto.NewSettingsResponse().FromSettings(util.StructToMap(settings))
	util.Res.Writer(w).Status().Data(map[string]*dto.SettingsResponse{
		"settings": response,
	})
}

// Helper function to validate theme values
func isValidTheme(theme string) bool {
	return theme == "light" || theme == "dark" || theme == "system"
}