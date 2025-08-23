package controller

import (
	"net/http"

	"github.com/dev-parvej/offline_kanban/pkg/database"
	"github.com/dev-parvej/offline_kanban/pkg/dto"
	"github.com/dev-parvej/offline_kanban/pkg/util"
	"github.com/gorilla/mux"
)

type Auth struct {
	router *mux.Router
	db     *database.Database
}

func AuthController(router *mux.Router, db *database.Database) *Auth {
	return &Auth{
		router: router,
		db:     db,
	}
}

func (auth *Auth) Router() {
	authRouter := auth.router.PathPrefix("/auth").Subrouter()

	// Authentication routes
	authRouter.HandleFunc("/login", auth.login).Methods("POST")
	authRouter.HandleFunc("/logout", auth.logout).Methods("POST")
	authRouter.HandleFunc("/refresh", auth.refreshToken).Methods("POST")
	authRouter.HandleFunc("/verify", auth.verifySession).Methods("GET")

	// User profile management
	authRouter.HandleFunc("/profile", auth.getProfile).Methods("GET")
	authRouter.HandleFunc("/profile", auth.updateProfile).Methods("PUT")
	authRouter.HandleFunc("/change-password", auth.changePassword).Methods("POST")
}

func (auth *Auth) login(w http.ResponseWriter, r *http.Request) {
	loginDto, errors := util.ValidateRequest(r, dto.LoginDto{})

	if errors != nil {
		util.Res.Writer(w).Status422().Data(errors.Error())
		return
	}

	// TODO: Implement login logic
	// 1. Validate username/password against database
	// 2. Generate JWT access and refresh tokens
	// 3. Return user data with tokens

	util.Res.Writer(w).Status().Data(map[string]string{
		"message": "Login endpoint - TODO: implement",
	})
}

func (auth *Auth) logout(w http.ResponseWriter, r *http.Request) {
	logoutDto, errors := util.ValidateRequest(r, dto.LogoutDto{})

	if errors != nil {
		util.Res.Writer(w).Status422().Data(errors.Error())
		return
	}

	// TODO: Implement logout logic
	// 1. Invalidate refresh token in database
	// 2. Clear user session

	util.Res.Writer(w).Status().Data(map[string]string{
		"message": "Logout endpoint - TODO: implement",
	})
}

func (auth *Auth) refreshToken(w http.ResponseWriter, r *http.Request) {
	refreshDto, errors := util.ValidateRequest(r, dto.RefreshTokenDto{})

	if errors != nil {
		util.Res.Writer(w).Status422().Data(errors.Error())
		return
	}

	// TODO: Implement token refresh logic
	// 1. Validate refresh token
	// 2. Generate new access token
	// 3. Optionally rotate refresh token
	// 4. Return new tokens

	util.Res.Writer(w).Status().Data(map[string]string{
		"message": "Refresh token endpoint - TODO: implement",
	})
}

func (auth *Auth) verifySession(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement session verification logic
	// 1. Extract JWT from Authorization header
	// 2. Validate JWT token
	// 3. Return user data if valid

	util.Res.Writer(w).Status().Data(map[string]string{
		"message": "Verify session endpoint - TODO: implement",
	})
}

func (auth *Auth) getProfile(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement get profile logic
	// 1. Extract user ID from JWT token
	// 2. Fetch user data from database
	// 3. Return user profile data

	util.Res.Writer(w).Status().Data(map[string]string{
		"message": "Get profile endpoint - TODO: implement",
	})
}

func (auth *Auth) updateProfile(w http.ResponseWriter, r *http.Request) {
	updateProfileDto, errors := util.ValidateRequest(r, dto.UpdateProfileDto{})

	if errors != nil {
		util.Res.Writer(w).Status422().Data(errors.Error())
		return
	}

	// TODO: Implement update profile logic
	// 1. Extract user ID from JWT token
	// 2. Update user data in database
	// 3. Return updated user profile

	util.Res.Writer(w).Status().Data(map[string]string{
		"message": "Update profile endpoint - TODO: implement",
	})
}

func (auth *Auth) changePassword(w http.ResponseWriter, r *http.Request) {
	changePasswordDto, errors := util.ValidateRequest(r, dto.ChangePasswordDto{})

	if errors != nil {
		util.Res.Writer(w).Status422().Data(errors.Error())
		return
	}

	// TODO: Implement change password logic
	// 1. Extract user ID from JWT token
	// 2. Validate current password
	// 3. Hash and update new password
	// 4. Optionally invalidate all refresh tokens

	util.Res.Writer(w).Status().Data(map[string]string{
		"message": "Change password endpoint - TODO: implement",
	})
}