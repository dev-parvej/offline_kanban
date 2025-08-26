package database

const (
	// Users table with all columns included
	createUsersTable = `
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL,
			name TEXT,
			designation TEXT,
			is_root BOOLEAN NOT NULL DEFAULT 0,
			is_active BOOLEAN NOT NULL DEFAULT 1,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);`

	createUsersUpdateTrigger = `
		DROP TRIGGER IF EXISTS update_users_updated_at;
		CREATE TRIGGER update_users_updated_at
		AFTER UPDATE ON users
		FOR EACH ROW
		BEGIN
			UPDATE users
			SET updated_at = CURRENT_TIMESTAMP
			WHERE id = OLD.id;
		END;`

	// Setup status table
	createSetupStatusTable = `
		CREATE TABLE IF NOT EXISTS setup_status (
			id INTEGER PRIMARY KEY CHECK (id = 1),
			is_complete BOOLEAN NOT NULL DEFAULT 0,
			completed_at DATETIME,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);`

	createSetupStatusUpdateTrigger = `
		DROP TRIGGER IF EXISTS update_setup_status_updated_at;
		CREATE TRIGGER update_setup_status_updated_at
		AFTER UPDATE ON setup_status
		FOR EACH ROW
		BEGIN
			UPDATE setup_status
			SET updated_at = CURRENT_TIMESTAMP
			WHERE id = OLD.id;
		END;`

	// Columns table with all columns included
	createColumnsTable = `
		CREATE TABLE IF NOT EXISTS columns (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title VARCHAR NOT NULL,
			created_by INTEGER NOT NULL,
			colors VARCHAR NULL,
			position INTEGER DEFAULT 0,
			deleted_at DATETIME NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
		);`

	createColumnsUpdateTrigger = `
		DROP TRIGGER IF EXISTS update_columns_updated_at;
		CREATE TRIGGER update_columns_updated_at
		AFTER UPDATE ON columns
		FOR EACH ROW
		BEGIN
			UPDATE columns
			SET updated_at = CURRENT_TIMESTAMP
			WHERE id = OLD.id;
		END;`

	// Tasks table
	createTasksTable = `
		CREATE TABLE IF NOT EXISTS tasks (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			description TEXT,
			column_id INTEGER NOT NULL,
			assigned_to INTEGER,
			created_by INTEGER NOT NULL,
			due_date DATETIME,
			priority VARCHAR NULL,
			position INTEGER NOT NULL,
			weight INTEGER DEFAULT 0,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE SET NULL,
			FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
			FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
		);`

	createTasksUpdateTrigger = `
		DROP TRIGGER IF EXISTS update_tasks_updated_at;
		CREATE TRIGGER update_tasks_updated_at
		AFTER UPDATE ON tasks
		FOR EACH ROW
		BEGIN
			UPDATE tasks
			SET updated_at = CURRENT_TIMESTAMP
			WHERE id = OLD.id;
		END;`

	// Comments table
	createCommentsTable = `
		CREATE TABLE IF NOT EXISTS comments (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			content TEXT NOT NULL,
			task_id INTEGER NOT NULL,
			created_by INTEGER NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
			FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
		);`

	createCommentsUpdateTrigger = `
		DROP TRIGGER IF EXISTS update_comments_updated_at;
		CREATE TRIGGER update_comments_updated_at
		AFTER UPDATE ON comments
		FOR EACH ROW
		BEGIN
			UPDATE comments
			SET updated_at = CURRENT_TIMESTAMP
			WHERE id = OLD.id;
		END;`

	// Checklists table
	createChecklistsTable = `
		CREATE TABLE IF NOT EXISTS checklists (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			created_by INTEGER NOT NULL,
			completed_by INTEGER,
			task_id INTEGER NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
			FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
			FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE SET NULL
		);`

	createChecklistsUpdateTrigger = `
		DROP TRIGGER IF EXISTS update_checklist_updated_at;
		CREATE TRIGGER update_checklist_updated_at
		AFTER UPDATE ON checklists
		FOR EACH ROW
		BEGIN
			UPDATE checklists
			SET updated_at = CURRENT_TIMESTAMP
			WHERE id = OLD.id;
		END;`

	// Refresh tokens table
	createRefreshTokensTable = `
		CREATE TABLE IF NOT EXISTS refresh_tokens (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			token TEXT UNIQUE NOT NULL,
			user_id INTEGER NOT NULL,
			expires_at DATETIME NOT NULL,
			is_revoked BOOLEAN NOT NULL DEFAULT 0,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		);`

	createRefreshTokensUpdateTrigger = `
		DROP TRIGGER IF EXISTS update_refresh_tokens_updated_at;
		CREATE TRIGGER update_refresh_tokens_updated_at
		AFTER UPDATE ON refresh_tokens
		FOR EACH ROW
		BEGIN
			UPDATE refresh_tokens
			SET updated_at = CURRENT_TIMESTAMP
			WHERE id = OLD.id;
		END;`

	// App settings table
	createAppSettingsTable = `
		CREATE TABLE IF NOT EXISTS app_settings (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			app_name VARCHAR(50) NOT NULL DEFAULT 'Offline Kanban',
			app_description TEXT,
			default_theme VARCHAR(10) NOT NULL DEFAULT 'system' CHECK (default_theme IN ('light', 'dark', 'system')),
			enable_notifications BOOLEAN NOT NULL DEFAULT 1,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);`

	createAppSettingsUpdateTrigger = `
		DROP TRIGGER IF EXISTS update_app_settings_updated_at;
		CREATE TRIGGER update_app_settings_updated_at
		AFTER UPDATE ON app_settings
		FOR EACH ROW
		BEGIN
			UPDATE app_settings
			SET updated_at = CURRENT_TIMESTAMP
			WHERE id = OLD.id;
		END;`

	insertDefaultAppSettings = `
		INSERT OR IGNORE INTO app_settings (id, app_name, app_description, default_theme, enable_notifications) 
		VALUES (1, 'Offline Kanban', 'A powerful offline-first Kanban board application', 'system', 1);`

	// Activities table
	createActivitiesTable = `
		CREATE TABLE IF NOT EXISTS activities (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			entity_type TEXT NOT NULL,
			entity_id INTEGER NOT NULL,
			action TEXT NOT NULL,
			field_name TEXT,
			old_value TEXT,
			new_value TEXT,
			user_id INTEGER NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
		);`

	createActivitiesUpdateTrigger = `
		DROP TRIGGER IF EXISTS update_activities_updated_at;
		CREATE TRIGGER update_activities_updated_at
		AFTER UPDATE ON activities
		FOR EACH ROW
		BEGIN
			UPDATE activities
			SET updated_at = CURRENT_TIMESTAMP
			WHERE id = OLD.id;
		END;`
)