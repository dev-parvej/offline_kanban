package repository

import (
	"database/sql"
	"errors"
	"time"

	"github.com/dev-parvej/offline_kanban/pkg/database"
)

type User struct {
	ID          int       `json:"id"`
	UserName    string    `json:"username"`
	Name        *string   `json:"name"`
	Designation *string   `json:"designation"`
	Password    string    `json:"-"` // Never serialize password
	IsRoot      bool      `json:"is_root"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type UserRepository struct {
	db *database.Database
}

func NewUserRepository(db *database.Database) *UserRepository {
	return &UserRepository{
		db: db,
	}
}

// Find user by ID
func (ur *UserRepository) FindArchivedByID(id int) (*User, error) {
	user := &User{}
	query := `
		SELECT id, username, name, designation, password, is_root, is_active, created_at, updated_at 
		FROM users 
		WHERE id = ?`

	err := ur.db.Instance().QueryRow(query, id).Scan(
		&user.ID,
		&user.UserName,
		&user.Name,
		&user.Designation,
		&user.Password,
		&user.IsRoot,
		&user.IsActive,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	return user, nil
}

// Find user by ID
func (ur *UserRepository) FindByID(id int) (*User, error) {
	user := &User{}
	query := `
		SELECT id, username, name, designation, password, is_root, is_active, created_at, updated_at 
		FROM users 
		WHERE id = ? AND is_active = 1`

	err := ur.db.Instance().QueryRow(query, id).Scan(
		&user.ID,
		&user.UserName,
		&user.Name,
		&user.Designation,
		&user.Password,
		&user.IsRoot,
		&user.IsActive,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	return user, nil
}

// Find user by username
func (ur *UserRepository) FindByUsername(username string) (*User, error) {
	user := &User{}
	query := `
		SELECT id, username, name, designation, password, is_root, is_active, created_at, updated_at 
		FROM users 
		WHERE username = ? AND is_active = 1`

	err := ur.db.Instance().QueryRow(query, username).Scan(
		&user.ID,
		&user.UserName,
		&user.Name,
		&user.Designation,
		&user.Password,
		&user.IsRoot,
		&user.IsActive,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	return user, nil
}

// Create new user
func (ur *UserRepository) Create(username, hashedPassword string, name, designation *string, isRoot bool) (*User, error) {
	query := `
		INSERT INTO users (username, password, name, designation, is_root, is_active, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`

	result, err := ur.db.Instance().Exec(query, username, hashedPassword, name, designation, isRoot)
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	return ur.FindByID(int(id))
}

// Update user profile
func (ur *UserRepository) UpdateProfile(id int, name, designation *string, isRoot *bool) (*User, error) {
	query := `
		UPDATE users 
		SET name = COALESCE(?, name),
		    designation = COALESCE(?, designation),
			is_root=?,
		    updated_at = CURRENT_TIMESTAMP
		WHERE id = ? AND is_active = 1`

	_, err := ur.db.Instance().Exec(query, name, designation, isRoot, id)
	if err != nil {
		return nil, err
	}

	return ur.FindByID(id)
}

// Update user password
func (ur *UserRepository) UpdatePassword(id int, hashedPassword string) error {
	query := `
		UPDATE users 
		SET password = ?, updated_at = CURRENT_TIMESTAMP 
		WHERE id = ? AND is_active = 1`

	result, err := ur.db.Instance().Exec(query, hashedPassword, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("user not found or inactive")
	}

	return nil
}

// Deactivate user (soft delete)
func (ur *UserRepository) DeactivateUser(id int) error {
	query := `
		UPDATE users 
		SET is_active = 0, updated_at = CURRENT_TIMESTAMP 
		WHERE id = ?`

	result, err := ur.db.Instance().Exec(query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("user not found")
	}

	return nil
}

// Deactivate user (soft delete)
func (ur *UserRepository) ActivateUser(id int) error {
	query := `
		UPDATE users 
		SET is_active = 1, updated_at = CURRENT_TIMESTAMP 
		WHERE id = ?`

	result, err := ur.db.Instance().Exec(query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("user not found")
	}

	return nil
}

// Get all active users
func (ur *UserRepository) GetAllUsers() ([]*User, error) {
	query := `
		SELECT id, username, name, designation, is_root, is_active, created_at, updated_at 
		FROM users
		ORDER BY created_at DESC`

	rows, err := ur.db.Instance().Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*User
	for rows.Next() {
		user := &User{}
		err := rows.Scan(
			&user.ID,
			&user.UserName,
			&user.Name,
			&user.Designation,
			&user.IsRoot,
			&user.IsActive,
			&user.CreatedAt,
			&user.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}

// Check if username exists
func (ur *UserRepository) UsernameExists(username string) (bool, error) {
	var count int
	query := `SELECT COUNT(*) FROM users WHERE username = ? AND is_active = 1`

	err := ur.db.Instance().QueryRow(query, username).Scan(&count)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}
