package controller

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/dev-parvej/js_array_method"
	"github.com/dev-parvej/offline_kanban/middleware"
	"github.com/dev-parvej/offline_kanban/pkg/database"
	"github.com/dev-parvej/offline_kanban/pkg/dto"
	"github.com/dev-parvej/offline_kanban/pkg/util"
	"github.com/dev-parvej/offline_kanban/repository"
	"github.com/gorilla/mux"
)

type Users struct {
	router                 *mux.Router
	userRepository         *repository.UserRepository
	refreshTokenRepository *repository.RefreshTokenRepository
	db                     *database.Database
}

func UserController(router *mux.Router, db *database.Database) *Users {
	return &Users{
		router:                 router,
		userRepository:         repository.NewUserRepository(db),
		db:                     db,
		refreshTokenRepository: repository.NewRefreshTokenRepository(db),
	}
}

func (users *Users) Router() {
	// User search endpoint (available to all authenticated users)
	searchRouter := users.router.PathPrefix("/users").Subrouter()
	searchRouter.Use(middleware.Authenticate)
	searchRouter.HandleFunc("/search", users.searchUsers).Methods("GET")

	// User management routes (admin only)
	adminRouter := users.router.PathPrefix("/admin/users").Subrouter()
	adminRouter.Use(middleware.Authenticate)
	adminRouter.Use(middleware.RequireRoot(users.db))

	// Admin user CRUD operations
	adminRouter.HandleFunc("", users.getAllUsers).Methods("GET")
	adminRouter.HandleFunc("", users.createUser).Methods("POST")
	adminRouter.HandleFunc("/{id:[0-9]+}", users.getUser).Methods("GET")
	adminRouter.HandleFunc("/{id:[0-9]+}", users.updateUser).Methods("PUT")
	adminRouter.HandleFunc("/{id:[0-9]+}/archive", users.archiveUser).Methods("POST")
	adminRouter.HandleFunc("/{id:[0-9]+}/unarchive", users.unarchiveUser).Methods("POST")
	adminRouter.HandleFunc("/{id:[0-9]+}/update-password", users.updatePassword).Methods("POST")
}

func (users *Users) getAllUsers(w http.ResponseWriter, r *http.Request) {
	// Parse and validate query parameters
	filter := users.parseUserFilter(r)

	// Validate the filter struct
	if err := util.ValidateStruct(filter); err != nil {
		util.Res.Writer(w).Status(400).Data(err.Error())
		return
	}

	// Get all users
	allUsers, err := users.userRepository.GetAllUsers()

	if err != nil {
		util.Res.Writer(w).Status(400).Data(err.Error())
		return
	}

	util.Res.Writer(w).Status().Data(js_array_method.Map(allUsers, func(user *repository.User, _ int) *dto.UserResponse {
		return dto.NewUserResponse().Create(user)
	}))
}

// Parse query parameters into UserFilterDto
func (users *Users) parseUserFilter(r *http.Request) dto.UserFilterDto {
	query := r.URL.Query()

	filter := dto.UserFilterDto{
		Search:   strings.TrimSpace(query.Get("search")),
		IsActive: query.Get("is_active"),
		IsRoot:   query.Get("is_root"),
	}

	// Parse page with default
	if page, err := strconv.Atoi(query.Get("page")); err == nil && page > 0 {
		filter.Page = page
	} else {
		filter.Page = 1
	}

	// Parse limit with default
	if limit, err := strconv.Atoi(query.Get("limit")); err == nil && limit > 0 && limit <= 100 {
		filter.Limit = limit
	} else {
		filter.Limit = 20
	}

	return filter
}

func (users *Users) getUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		util.Res.Writer(w).Status(400).Data("Invalid user ID")
		return
	}

	user, err := users.userRepository.FindByID(id)

	if err != nil {
		util.Res.Writer(w).Status(404).Data(err.Error())
		return
	}

	util.Res.Writer(w).Status().Data(dto.NewUserResponse().Create(user))
}

func (users *Users) createUser(w http.ResponseWriter, r *http.Request) {
	createUserDto, errors := util.ValidateRequest(r, dto.CreateUserDto{})

	if errors != nil {
		util.Res.Writer(w).Status422().Data(errors.Error())
		return
	}

	// Check if username already exists
	exists, err := users.userRepository.UsernameExists(createUserDto.UserName)
	if err != nil {
		util.Res.Writer(w).Status(500).Data(err.Error())
		return
	}

	if exists {
		util.Res.Writer(w).Status(400).Data("Username already exists")
		return
	}

	// Hash password
	hashedPassword, err := util.HashPassword(createUserDto.Password)
	if err != nil {
		util.Res.Writer(w).Status(500).Data("Failed to hash password")
		return
	}

	// Create user (normal user, not root)
	var name, designation *string
	if createUserDto.Name != "" {
		name = &createUserDto.Name
	}
	if createUserDto.Designation != "" {
		designation = &createUserDto.Designation
	}

	user, err := users.userRepository.Create(
		createUserDto.UserName,
		hashedPassword,
		name,
		designation,
		util.IfThenElse(createUserDto.IsRoot, true, false).(bool), // isRoot = false for normal users
	)

	if err != nil {
		util.Res.Writer(w).Status(500).Data(err.Error())
		return
	}

	response := dto.NewUserResponse().Create(user)
	util.Res.Writer(w).Status().Data(map[string]*dto.UserResponse{
		"user": response,
	})
}

func (users *Users) updateUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := util.ParseInt(vars["id"])

	updateUserDto, errors := util.ValidateRequest(r, dto.UpdateUserDto{})

	if errors != nil {
		util.Res.Writer(w).Status422().Data(errors.Error())
		return
	}

	// Check if user exists
	_, err := users.userRepository.FindByID(id)
	if err != nil {
		util.Res.Writer(w).Status(404).Data(err.Error())
		return
	}

	// Update user profile
	user, err := users.userRepository.UpdateProfile(id, updateUserDto.Name, updateUserDto.Designation, &updateUserDto.IsRoot)

	if err != nil {
		util.Res.Writer(w).Status(500).Data(err.Error())
		return
	}

	response := dto.NewUserResponse().Create(user)
	util.Res.Writer(w).Status().Data(map[string]*dto.UserResponse{
		"user": response,
	})
}

func (users *Users) archiveUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		util.Res.Writer(w).Status(400).Data("Invalid user ID")
		return
	}

	// Get current user ID to prevent self-deactivation
	currentUserId := r.Header.Get("user_id")
	if currentUserId == strconv.Itoa(id) {
		util.Res.Writer(w).Status(400).Data("Cannot deactivate your own account")
		return
	}

	_, err = users.userRepository.FindByID(id)

	if err != nil {
		util.Res.Writer(w).Status(404).Data(err.Error())
		return
	}

	err = users.userRepository.DeactivateUser(id)

	if err != nil {
		util.Res.Writer(w).Status(404).Data(err.Error())
		return
	}

	util.Res.Writer(w).Status().Data(map[string]string{
		"message": "User archived successfully",
	})
}

func (users *Users) unarchiveUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		util.Res.Writer(w).Status(400).Data("Invalid user ID")
		return
	}

	// Get current user ID to prevent self-deactivation
	currentUserId := r.Header.Get("user_id")
	if currentUserId == strconv.Itoa(id) {
		util.Res.Writer(w).Status(400).Data("Cannot deactivate your own account")
		return
	}

	user, err := users.userRepository.FindArchivedByID(id)

	if err != nil {
		util.Res.Writer(w).Status(404).Data(err.Error())
		return
	}

	if user.IsActive {
		util.Res.Writer(w).Status(400).Data("User already unarchived")
		return
	}

	err = users.userRepository.ActivateUser(id)

	if err != nil {
		util.Res.Writer(w).Status(404).Data(err.Error())
		return
	}

	util.Res.Writer(w).Status().Data(map[string]string{
		"message": "User unarchived successfully",
	})
}

func (users *Users) updatePassword(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := util.ParseInt(vars["id"])
	changePasswordDto, errors := util.ValidateRequest(r, dto.UpdatePasswordDto{})

	if errors != nil {
		util.Res.Writer(w).Status422().Data(errors.Error())
		return
	}

	user, err := users.userRepository.FindByID(id)

	if err != nil {
		util.Res.Writer(w).Status(404).Data(map[string]string{"message": "User not found"})
		return
	}

	hashed, err := util.HashPassword(changePasswordDto.NewPassword)

	if err != nil {
		util.Res.Writer(w).Status(404).Data(map[string]string{"message": "Something went wrong"})
		return
	}

	users.userRepository.UpdatePassword(user.ID, hashed)

	go users.refreshTokenRepository.RevokeAllUserTokens(user.ID)

	util.Res.Writer(w).Status().Data(map[string]string{
		"message": "Passowrd updated please ask user to re-login",
	})
}

func (users *Users) searchUsers(w http.ResponseWriter, r *http.Request) {
	query := strings.TrimSpace(r.URL.Query().Get("q"))
	
	if query == "" {
		util.Res.Writer(w).Status(400).Data("Search query is required")
		return
	}

	// Search users by username or name
	searchedUsers, err := users.userRepository.SearchUsers(query)
	
	if err != nil {
		util.Res.Writer(w).Status(500).Data(err.Error())
		return
	}

	util.Res.Writer(w).Status().Data(js_array_method.Map(searchedUsers, func(user *repository.User, _ int) *dto.UserResponse {
		return dto.NewUserResponse().Create(user)
	}))
}
