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

	_, err = db.Exec(`
		DROP TRIGGER IF EXISTS update_users_updated_at;
		CREATE TRIGGER update_users_updated_at
		AFTER UPDATE ON users
		FOR EACH ROW
		BEGIN
			UPDATE users
			SET updated_at = CURRENT_TIMESTAMP
			WHERE id = OLD.id;
		END;
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

	_, err = db.Exec(`
		DROP TRIGGER IF EXISTS update_setup_status_updated_at;
		CREATE TRIGGER update_setup_status_updated_at
		AFTER UPDATE ON setup_status
		FOR EACH ROW
		BEGIN
			UPDATE setup_status
			SET updated_at = CURRENT_TIMESTAMP
			WHERE id = OLD.id;
		END;
	`)

	if err != nil {
		return err
	}

	_, err = db.Exec(`
        CREATE TABLE IF NOT EXISTS columns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title varchar NOT NULL,
            created_by INTEGER NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            colors varchar NULL,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
        );
    `)

	if err != nil {
		return err
	}

	_, err = db.Exec(`
		DROP TRIGGER IF EXISTS update_columns_updated_at;
		CREATE TRIGGER update_columns_updated_at
		AFTER UPDATE ON columns
		FOR EACH ROW
		BEGIN
			UPDATE columns
			SET updated_at = CURRENT_TIMESTAMP
			WHERE id = OLD.id;
		END;
	`)

	if err != nil {
		return err
	}

	_, err = db.Exec(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            column_id INTEGER NOT NULL,
            assigned_to INTEGER,
            created_by INTEGER NOT NULL,
            due_date DATETIME,
			priority varchar NULL,
            position INTEGER NOT NULL,
			weight INTEGER default 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE SET NULL,
            FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
        );
    `)
	if err != nil {
		return err
	}

	_, err = db.Exec(`
		DROP TRIGGER IF EXISTS update_tasks_updated_at;
		CREATE TRIGGER update_tasks_updated_at
		AFTER UPDATE ON tasks
		FOR EACH ROW
		BEGIN
			UPDATE tasks
			SET updated_at = CURRENT_TIMESTAMP
			WHERE id = OLD.id;
		END;
	`)

	if err != nil {
		return err
	}

	_, err = db.Exec(`
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            task_id INTEGER NOT NULL,
            created_by INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
        );
    `)
	if err != nil {
		return err
	}

	_, err = db.Exec(`
		DROP TRIGGER IF EXISTS update_comments_updated_at;
		CREATE TRIGGER update_comments_updated_at
		AFTER UPDATE ON comments
		FOR EACH ROW
		BEGIN
			UPDATE comments
			SET updated_at = CURRENT_TIMESTAMP
			WHERE id = OLD.id;
		END;
	`)

	if err != nil {
		return err
	}

	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS  checklists (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			created_by INTEGER NOT NULL,
			completed_by INTEGER,
			task_id INTEGER NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE  SET NULL,
			FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE  SET NULL,
			FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE SET NULL
		);
	`)

	if err != nil {
		return err
	}

	_, err = db.Exec(`
		DROP TRIGGER IF EXISTS update_checklist_updated_at;
		CREATE TRIGGER update_checklist_updated_at
		AFTER UPDATE ON checklists
		FOR EACH ROW
		BEGIN
			UPDATE checklists
			SET updated_at = CURRENT_TIMESTAMP
			WHERE id = OLD.id;
		END;
	`)

	if err != nil {
		return err
	}

	// Refresh tokens table
	_, err = db.Exec(`
        CREATE TABLE IF NOT EXISTS refresh_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            token TEXT UNIQUE NOT NULL,
            user_id INTEGER NOT NULL,
            expires_at DATETIME NOT NULL,
            is_revoked BOOLEAN NOT NULL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `)
	if err != nil {
		return err
	}

	_, err = db.Exec(`
		DROP TRIGGER IF EXISTS update_refresh_tokens_updated_at;
		CREATE TRIGGER update_refresh_tokens_updated_at
		AFTER UPDATE ON refresh_tokens
		FOR EACH ROW
		BEGIN
			UPDATE refresh_tokens
			SET updated_at = CURRENT_TIMESTAMP
			WHERE id = OLD.id;
		END;
	`)
	if err != nil {
		return err
	}

	// Update users table to add missing fields (will only add if not exists)
	db.Exec(`ALTER TABLE users ADD COLUMN name TEXT;`)
	// Ignore error if column already exists

	db.Exec(`ALTER TABLE users ADD COLUMN designation TEXT;`)
	// Ignore error if column already exists

	db.Exec(`ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;`)
	// Ignore error if column already exists

	db.Exec(`ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT 1;`)
	// Ignore error if column already exists

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
