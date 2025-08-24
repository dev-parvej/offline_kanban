package middleware

import (
	"net/http"
	"strconv"

	"github.com/dev-parvej/offline_kanban/pkg/database"
	"github.com/dev-parvej/offline_kanban/pkg/util"
	"github.com/dev-parvej/offline_kanban/repository"
)

// RequireRoot middleware checks if the authenticated user is a root user
func RequireRoot(db *database.Database) func(http.Handler) http.Handler {
	return func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get user ID from header (set by Authenticate middleware)
			userId := r.Header.Get("user_id")
			if userId == "" {
				util.Res.Writer(w).Status(403).Data(map[string]string{
					"message": "User authentication required",
				})
				return
			}

			userIdInt, err := strconv.Atoi(userId)
			if err != nil {
				util.Res.Writer(w).Status(400).Data(map[string]string{
					"message": "Invalid user ID",
				})
				return
			}

			// Check if user exists and is root
			userRepo := repository.NewUserRepository(db)
			user, err := userRepo.FindByID(userIdInt)
			if err != nil {
				util.Res.Writer(w).Status(404).Data(map[string]string{
					"message": "User not found",
				})
				return
			}

			if !user.IsRoot {
				util.Res.Writer(w).Status(403).Data(map[string]string{
					"message": "Root access required",
				})
				return
			}

			// User is authenticated and is root, proceed
			h.ServeHTTP(w, r)
		})
	}
}