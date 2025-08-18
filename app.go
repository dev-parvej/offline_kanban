package main

import (
	"context"
	"fmt"

	"github.com/dev-parvej/offline_kanban/pkg/database"
	"github.com/dev-parvej/offline_kanban/pkg/util"
)

// App struct
type App struct {
	ctx context.Context
	db  *database.Database
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	db, err := database.InitDatabase()

	fmt.Println(db)
	fmt.Println(err)

	if err != nil {
		panic(err)
	}
	a.db = db
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// IsSetupComplete checks if the initial setup is done
func (a *App) IsSetupComplete() bool {
	return a.db.IsSetupComplete()
}

// SetupRoot creates the root user during first run
func (a *App) SetupRoot(username, password string) error {
	hashed, _ := util.HashPassword(password)
	return a.db.CreateRootUser(username, hashed)
}

// Login validates user credentials
func (a *App) Login(username, password string) (bool, bool, error) {
	return a.db.ValidateUser(username, password)
}

// AddUser adds a new user (only available to root)
func (a *App) AddUser(username, password string) error {
	return a.db.AddUser(username, password)
}
