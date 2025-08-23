package repository

import (
	"database/sql"
	"errors"
	"time"

	"github.com/dev-parvej/offline_kanban/pkg/database"
)

type RefreshToken struct {
	ID        int       `json:"id"`
	Token     string    `json:"token"`
	UserID    int       `json:"user_id"`
	ExpiresAt time.Time `json:"expires_at"`
	IsRevoked bool      `json:"is_revoked"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type RefreshTokenRepository struct {
	db *database.Database
}

func NewRefreshTokenRepository(db *database.Database) *RefreshTokenRepository {
	return &RefreshTokenRepository{
		db: db,
	}
}

// Create new refresh token
func (rtr *RefreshTokenRepository) Create(userID int, token string, expiresAt time.Time) (*RefreshToken, error) {
	query := `
		INSERT INTO refresh_tokens (user_id, token, expires_at, is_revoked, created_at, updated_at)
		VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`

	result, err := rtr.db.Instance().Exec(query, userID, token, expiresAt)
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	return rtr.FindByID(int(id))
}

// Find refresh token by ID
func (rtr *RefreshTokenRepository) FindByID(id int) (*RefreshToken, error) {
	token := &RefreshToken{}
	query := `
		SELECT id, user_id, token, expires_at, is_revoked, created_at, updated_at
		FROM refresh_tokens 
		WHERE id = ?`

	err := rtr.db.Instance().QueryRow(query, id).Scan(
		&token.ID,
		&token.UserID,
		&token.Token,
		&token.ExpiresAt,
		&token.IsRevoked,
		&token.CreatedAt,
		&token.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("refresh token not found")
		}
		return nil, err
	}

	return token, nil
}

// Find valid refresh token by token string
func (rtr *RefreshTokenRepository) FindByToken(token string) (*RefreshToken, error) {
	refreshToken := &RefreshToken{}
	query := `
		SELECT id, user_id, token, expires_at, is_revoked, created_at, updated_at
		FROM refresh_tokens 
		WHERE token = ? AND is_revoked = 0 AND expires_at > CURRENT_TIMESTAMP`

	err := rtr.db.Instance().QueryRow(query, token).Scan(
		&refreshToken.ID,
		&refreshToken.UserID,
		&refreshToken.Token,
		&refreshToken.ExpiresAt,
		&refreshToken.IsRevoked,
		&refreshToken.CreatedAt,
		&refreshToken.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("refresh token not found or expired")
		}
		return nil, err
	}

	return refreshToken, nil
}

// Revoke specific refresh token
func (rtr *RefreshTokenRepository) RevokeToken(token string) error {
	query := `
		UPDATE refresh_tokens 
		SET is_revoked = 1, updated_at = CURRENT_TIMESTAMP 
		WHERE token = ?`

	result, err := rtr.db.Instance().Exec(query, token)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("refresh token not found")
	}

	return nil
}

// Revoke all tokens for a user
func (rtr *RefreshTokenRepository) RevokeAllUserTokens(userID int) error {
	query := `
		UPDATE refresh_tokens 
		SET is_revoked = 1, updated_at = CURRENT_TIMESTAMP 
		WHERE user_id = ? AND is_revoked = 0`

	_, err := rtr.db.Instance().Exec(query, userID)
	return err
}

// Check if token is valid (not revoked and not expired)
func (rtr *RefreshTokenRepository) IsTokenValid(token string) (bool, error) {
	var count int
	query := `
		SELECT COUNT(*) 
		FROM refresh_tokens 
		WHERE token = ? AND is_revoked = 0 AND expires_at > CURRENT_TIMESTAMP`

	err := rtr.db.Instance().QueryRow(query, token).Scan(&count)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

// Get all active tokens for a user
func (rtr *RefreshTokenRepository) GetUserTokens(userID int) ([]*RefreshToken, error) {
	query := `
		SELECT id, user_id, token, expires_at, is_revoked, created_at, updated_at
		FROM refresh_tokens 
		WHERE user_id = ? AND is_revoked = 0 AND expires_at > CURRENT_TIMESTAMP
		ORDER BY created_at DESC`

	rows, err := rtr.db.Instance().Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tokens []*RefreshToken
	for rows.Next() {
		token := &RefreshToken{}
		err := rows.Scan(
			&token.ID,
			&token.UserID,
			&token.Token,
			&token.ExpiresAt,
			&token.IsRevoked,
			&token.CreatedAt,
			&token.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		tokens = append(tokens, token)
	}

	return tokens, nil
}

// Clean up expired and revoked tokens
func (rtr *RefreshTokenRepository) CleanupExpiredTokens() error {
	query := `
		DELETE FROM refresh_tokens 
		WHERE expires_at < CURRENT_TIMESTAMP OR is_revoked = 1`

	_, err := rtr.db.Instance().Exec(query)
	return err
}

// Count active tokens for a user
func (rtr *RefreshTokenRepository) CountUserTokens(userID int) (int, error) {
	var count int
	query := `
		SELECT COUNT(*) 
		FROM refresh_tokens 
		WHERE user_id = ? AND is_revoked = 0 AND expires_at > CURRENT_TIMESTAMP`

	err := rtr.db.Instance().QueryRow(query, userID).Scan(&count)
	if err != nil {
		return 0, err
	}

	return count, nil
}