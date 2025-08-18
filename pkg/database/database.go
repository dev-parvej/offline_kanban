package database

import (
	"database/sql"
	"os"
	"path/filepath"

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
	dbPath := filepath.Join(dbDir, "app.db")
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
	// Users table
	_, err := db.Exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            is_root BOOLEAN NOT NULL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `)
	if err != nil {
		return err
	}

	// Setup tracking table
	_, err = db.Exec(`
        CREATE TABLE IF NOT EXISTS setup_status (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            is_complete BOOLEAN NOT NULL DEFAULT 0,
            completed_at DATETIME
        )
    `)
	if err != nil {
		return err
	}

	return nil
}

// Check if initial setup is complete
func (d *Database) IsSetupComplete() bool {
	var isComplete bool
	err := d.db.QueryRow("SELECT is_complete FROM setup_status WHERE id = 1").Scan(&isComplete)
	if err != nil {
		return false
	}
	return isComplete
}

// Create root user and mark setup as complete
func (d *Database) CreateRootUser(username, password string) error {
	tx, err := d.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Insert root user
	_, err = tx.Exec(`
        INSERT INTO users (username, password, is_root)
        VALUES (?, ?, 1)
    `, username, password) // Note: In production, password should be hashed
	if err != nil {
		return err
	}

	// Mark setup as complete
	_, err = tx.Exec(`
        INSERT OR REPLACE INTO setup_status (id, is_complete, completed_at)
        VALUES (1, 1, CURRENT_TIMESTAMP)
    `)
	if err != nil {
		return err
	}

	return tx.Commit()
}

// Add new user (only root can add)
func (d *Database) AddUser(username, password string) error {
	_, err := d.db.Exec(`
        INSERT INTO users (username, password, is_root)
        VALUES (?, ?, 0)
    `, username, password) // Note: In production, password should be hashed
	return err
}

// Validate user credentials
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
