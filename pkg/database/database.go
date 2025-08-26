package database

import (
	"database/sql"
	"os"
	"path/filepath"

	"github.com/dev-parvej/offline_kanban/config"
	"github.com/dev-parvej/offline_kanban/pkg/util"
	_ "github.com/mattn/go-sqlite3"
)

type Database struct {
	db *sql.DB
}

func InitDatabase() (*Database, error) {
	// Ensure db directory exists
	dbDir := "db"
	if err := os.MkdirAll(dbDir, 0755); err != nil {
		return nil, err
	}

	// Open database
	dbPath := filepath.Join(dbDir, config.Get("DB_NAME"))
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, err
	}

	// Create tables
	if err := createTables(db); err != nil {
		return nil, err
	}

	return &Database{db: db}, nil
}

func createTables(db *sql.DB) error {
	// Users table and trigger
	if _, err := db.Exec(createUsersTable); err != nil {
		return err
	}
	if _, err := db.Exec(createUsersUpdateTrigger); err != nil {
		return err
	}

	// Setup status table and trigger
	if _, err := db.Exec(createSetupStatusTable); err != nil {
		return err
	}
	if _, err := db.Exec(createSetupStatusUpdateTrigger); err != nil {
		return err
	}

	// Columns table and trigger
	if _, err := db.Exec(createColumnsTable); err != nil {
		return err
	}
	if _, err := db.Exec(createColumnsUpdateTrigger); err != nil {
		return err
	}

	// Tasks table and trigger
	if _, err := db.Exec(createTasksTable); err != nil {
		return err
	}
	if _, err := db.Exec(createTasksUpdateTrigger); err != nil {
		return err
	}

	// Comments table and trigger
	if _, err := db.Exec(createCommentsTable); err != nil {
		return err
	}
	if _, err := db.Exec(createCommentsUpdateTrigger); err != nil {
		return err
	}

	// Checklists table and trigger
	if _, err := db.Exec(createChecklistsTable); err != nil {
		return err
	}
	if _, err := db.Exec(createChecklistsUpdateTrigger); err != nil {
		return err
	}

	// Refresh tokens table and trigger
	if _, err := db.Exec(createRefreshTokensTable); err != nil {
		return err
	}
	if _, err := db.Exec(createRefreshTokensUpdateTrigger); err != nil {
		return err
	}

	// App settings table and trigger
	if _, err := db.Exec(createAppSettingsTable); err != nil {
		return err
	}
	if _, err := db.Exec(createAppSettingsUpdateTrigger); err != nil {
		return err
	}

	// Insert default app settings
	if _, err := db.Exec(insertDefaultAppSettings); err != nil {
		return err
	}

	// Activities table and trigger
	if _, err := db.Exec(createActivitiesTable); err != nil {
		return err
	}
	if _, err := db.Exec(createActivitiesUpdateTrigger); err != nil {
		return err
	}

	return nil
}

func (d *Database) Instance() *sql.DB {
	return d.db
}

func (d *Database) AddUser(username, password string) error {
	_, err := d.db.Exec(`
        INSERT INTO users (username, password, is_root)
        VALUES (?, ?, 0)
    `, username, password)
	return err
}

func (d *Database) ValidateUser(username, password string) (bool, bool, error) {
	var storedPassword string
	var isRoot bool
	err := d.db.QueryRow(`
        SELECT password, is_root FROM users WHERE username = ?
    `, username).Scan(&storedPassword, &isRoot)

	if err == sql.ErrNoRows {
		return false, false, nil
	}
	if err != nil {
		return false, false, err
	}

	return util.ComparePassword(storedPassword, password), isRoot, nil
}