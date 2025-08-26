package controller

import (
	"net/http"

	"github.com/dev-parvej/offline_kanban/pkg/database"
	"github.com/dev-parvej/offline_kanban/pkg/dto"
	"github.com/dev-parvej/offline_kanban/pkg/util"
	"github.com/gorilla/mux"
)

type Setup struct {
	router *mux.Router
	db     *database.Database
}

func SetupController(router *mux.Router, db *database.Database) *Setup {
	return &Setup{
		router: router,
		db:     db,
	}
}

func (setup *Setup) Router() {
	setupRouter := setup.router.PathPrefix("/setup").Subrouter()

	setupRouter.HandleFunc("/is-setup-complete", setup.isSetupComplete).Methods("GET")
	setupRouter.HandleFunc("/settings", setup.getSettings).Methods("GET")
	setupRouter.HandleFunc("/root-user", setup.createRootUser).Methods("POST")
}

func (setup *Setup) isSetupComplete(w http.ResponseWriter, r *http.Request) {
	var isComplete bool

	err := setup.db.Instance().QueryRow("SELECT is_complete FROM setup_status WHERE id = 1").Scan(&isComplete)

	if err != nil {
		util.Res.Writer(w).Status().Data(false)
		return
	}

	util.Res.Writer(w).Status().Data(isComplete)
}

func (setup *Setup) getSettings(w http.ResponseWriter, r *http.Request) {
	var appName string

	err := setup.db.Instance().QueryRow("SELECT app_name FROM app_settings limit 1").Scan(&appName)

	if err != nil {
		util.Res.Writer(w).Status(400).Data(false)
		return
	}

	util.Res.Writer(w).Status().Data(appName)
}

func (setup *Setup) createRootUser(w http.ResponseWriter, r *http.Request) {
	createUserDto, errors := util.ValidateRequest(r, dto.CreateUserDto{})

	if errors != nil {
		util.Res.Writer(w).Status422().Data(errors.Error())
		return
	}

	db := setup.db.Instance()

	tx, err := db.Begin()
	if err != nil {
		util.Res.Writer(w).Status422().Data(err)
		return
	}

	defer tx.Rollback()

	password, _ := util.HashPassword(createUserDto.Password)

	// Insert root user
	_, err = tx.Exec(`
        INSERT INTO users (username, password, is_root)
        VALUES (?, ?, 1)
    `, createUserDto.UserName, password)

	if err != nil {
		util.Res.Writer(w).Status422().Data(err.Error())
		return
	}

	// Mark setup as complete
	_, err = tx.Exec(`
        INSERT OR REPLACE INTO setup_status (id, is_complete, completed_at)
        VALUES (1, 1, CURRENT_TIMESTAMP)
    `)
	if err != nil {
		util.Res.Writer(w).Status422().Data(err.Error())
		return
	}

	tx.Commit()

	util.Res.Status().Writer(w).Data(map[string]string{
		"message": "Setup is complete",
	})
}
