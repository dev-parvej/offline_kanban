package main

import (
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/dev-parvej/offline_kanban/config"
	"github.com/dev-parvej/offline_kanban/controller"
	"github.com/dev-parvej/offline_kanban/pkg/database"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

func SetUpGorilaMuxServer(db *database.Database) http.Handler {
	router := mux.NewRouter()

	controller.SetupController(router, db).Router()
	controller.AuthController(router, db).Router()

	// Example root API route
	if isDev() {
		fmt.Println("🚀 Running in DEV mode, proxying to Vite server (http://localhost:5173)")
		devURL, _ := url.Parse("http://localhost:5173")
		proxy := httputil.NewSingleHostReverseProxy(devURL)
		router.PathPrefix("/").Handler(proxy)
	} else {
		fmt.Println("📦 Running in PROD mode, serving embedded frontend")
		fs := http.FS(frontend)
		fileServer := http.FileServer(fs)
		router.PathPrefix("/").Handler(http.StripPrefix("/", fileServer))
	}

	cors := handlers.CORS(
		handlers.AllowedOrigins([]string{"*"}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"}),
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization", "X-Requested-With"}),
	)

	return cors(router)
}

func isDev() bool {
	return config.Get("ENV") == "dev"
}
