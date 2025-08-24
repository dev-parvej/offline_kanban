package controller

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/dev-parvej/offline_kanban/middleware"
	"github.com/dev-parvej/offline_kanban/pkg/database"
	"github.com/dev-parvej/offline_kanban/pkg/dto"
	"github.com/dev-parvej/offline_kanban/pkg/util"
	"github.com/dev-parvej/offline_kanban/repository"
	"github.com/gorilla/mux"
)

type Tasks struct {
	router           *mux.Router
	taskRepository   *repository.TaskRepository
	userRepository   *repository.UserRepository
	columnRepository *repository.ColumnRepository
	db               *database.Database
}

func TaskController(router *mux.Router, db *database.Database) *Tasks {
	return &Tasks{
		router:           router,
		taskRepository:   repository.NewTaskRepository(db),
		userRepository:   repository.NewUserRepository(db),
		columnRepository: repository.NewColumnRepository(db),
		db:               db,
	}
}

func (tasks *Tasks) Router() {
	// All task routes require authentication
	taskRouter := tasks.router.PathPrefix("/tasks").Subrouter()
	taskRouter.Use(middleware.Authenticate)

	// Public task operations (all authenticated users)
	taskRouter.HandleFunc("", tasks.getAllTasks).Methods("GET")
	taskRouter.HandleFunc("", tasks.createTask).Methods("POST")
	taskRouter.HandleFunc("/{id:[0-9]+}", tasks.getTask).Methods("GET")
	taskRouter.HandleFunc("/{id:[0-9]+}", tasks.updateTask).Methods("PUT")
	taskRouter.HandleFunc("/{id:[0-9]+}/move", tasks.moveTask).Methods("POST")

	// Admin-only task operations (root users only)
	adminTaskRouter := tasks.router.PathPrefix("/admin/tasks").Subrouter()
	adminTaskRouter.Use(middleware.Authenticate)
	adminTaskRouter.Use(middleware.RequireRoot(tasks.db))

	adminTaskRouter.HandleFunc("/{id:[0-9]+}", tasks.deleteTask).Methods("DELETE")
	adminTaskRouter.HandleFunc("/{id:[0-9]+}/force-update", tasks.forceUpdateTask).Methods("PUT")
}

func (tasks *Tasks) getAllTasks(w http.ResponseWriter, r *http.Request) {
	// Parse and validate query parameters
	filter := tasks.parseTaskFilter(r)
	
	// Validate the filter struct
	if err := util.ValidateStruct(filter); err != nil {
		util.Res.Writer(w).Status(400).Data(err.Error())
		return
	}

	// Convert DTO to repository filters
	repoFilters := tasks.convertToRepoFilters(filter)

	// Get tasks with relations (includes user and column data)
	allTasks, err := tasks.taskRepository.GetWithRelations(repoFilters)
	if err != nil {
		util.Res.Writer(w).Status(500).Data(err.Error())
		return
	}

	// Get total count for pagination
	totalCount, err := tasks.taskRepository.CountWithFilters(repoFilters)
	if err != nil {
		util.Res.Writer(w).Status(500).Data(err.Error())
		return
	}

	// Convert to response DTOs
	taskResponses := make([]dto.TaskResponseDto, len(allTasks))
	for i, task := range allTasks {
		taskResponses[i] = tasks.convertToResponseDto(task)
	}

	// Calculate pagination
	page := 1
	pageSize := 20
	if filter.Page != nil && *filter.Page > 0 {
		page = *filter.Page
	}
	if filter.PageSize != nil && *filter.PageSize > 0 {
		pageSize = *filter.PageSize
	}

	totalPages := (totalCount + pageSize - 1) / pageSize

	response := dto.TaskListResponseDto{
		Tasks:      taskResponses,
		Total:      totalCount,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}

	util.Res.Writer(w).Status().Data(response)
}

func (tasks *Tasks) getTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		util.Res.Writer(w).Status(400).Data("Invalid task ID")
		return
	}

	task, err := tasks.taskRepository.FindByID(id)

	if err != nil {
		util.Res.Writer(w).Status(404).Data(err.Error())
		return
	}

	response := tasks.convertToResponseDto(task)
	util.Res.Writer(w).Status().Data(map[string]dto.TaskResponseDto{
		"task": response,
	})
}

func (tasks *Tasks) createTask(w http.ResponseWriter, r *http.Request) {
	createTaskDto, errors := util.ValidateRequest(r, dto.CreateTaskDto{})

	if errors != nil {
		util.Res.Writer(w).Status422().Data(errors.Error())
		return
	}

	// Get current user ID
	userId := r.Header.Get("user_id")
	userIdInt, err := strconv.Atoi(userId)
	if err != nil {
		util.Res.Writer(w).Status(400).Data("Invalid user ID")
		return
	}

	// Validate column exists
	_, err = tasks.columnRepository.FindByID(createTaskDto.ColumnID)
	if err != nil {
		util.Res.Writer(w).Status(400).Data("Invalid column ID")
		return
	}

	// Validate assigned user exists (if provided)
	if createTaskDto.AssignedTo != nil {
		_, err = tasks.userRepository.FindByID(*createTaskDto.AssignedTo)
		if err != nil {
			util.Res.Writer(w).Status(400).Data("Invalid assigned user ID")
			return
		}
	}

	// Parse due date if provided
	var dueDate *time.Time
	if createTaskDto.DueDate != nil {
		parsedDate, err := time.Parse(time.RFC3339, *createTaskDto.DueDate)
		if err != nil {
			util.Res.Writer(w).Status(400).Data("Invalid due date format. Use ISO 8601 format")
			return
		}
		dueDate = &parsedDate
	}

	// Create task
	task, err := tasks.taskRepository.Create(
		createTaskDto.Title,
		createTaskDto.Description,
		createTaskDto.ColumnID,
		userIdInt,
		createTaskDto.AssignedTo,
		dueDate,
		createTaskDto.Priority,
	)

	if err != nil {
		util.Res.Writer(w).Status(500).Data(err.Error())
		return
	}

	response := tasks.convertToResponseDto(task)
	util.Res.Writer(w).Status().Data(map[string]dto.TaskResponseDto{
		"task": response,
	})
}

func (tasks *Tasks) updateTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		util.Res.Writer(w).Status(400).Data("Invalid task ID")
		return
	}

	updateTaskDto, errors := util.ValidateRequest(r, dto.UpdateTaskDto{})

	if errors != nil {
		util.Res.Writer(w).Status422().Data(errors.Error())
		return
	}

	// Check if task exists
	existingTask, err := tasks.taskRepository.FindByID(id)
	if err != nil {
		util.Res.Writer(w).Status(404).Data(err.Error())
		return
	}

	// Get current user ID
	userId := r.Header.Get("user_id")
	userIdInt, err := strconv.Atoi(userId)
	if err != nil {
		util.Res.Writer(w).Status(400).Data("Invalid user ID")
		return
	}

	// Check permissions: users can only edit their own tasks (unless they're root)
	currentUser, err := tasks.userRepository.FindByID(userIdInt)
	if err != nil {
		util.Res.Writer(w).Status(500).Data("Failed to get user info")
		return
	}

	if !currentUser.IsRoot && existingTask.CreatedBy != userIdInt {
		util.Res.Writer(w).Status(403).Data("You can only edit your own tasks")
		return
	}

	// Validate assigned user exists (if being updated)
	if updateTaskDto.AssignedTo != nil {
		_, err = tasks.userRepository.FindByID(*updateTaskDto.AssignedTo)
		if err != nil {
			util.Res.Writer(w).Status(400).Data("Invalid assigned user ID")
			return
		}
	}

	// Parse due date if provided
	var dueDate *time.Time
	if updateTaskDto.DueDate != nil {
		parsedDate, err := time.Parse(time.RFC3339, *updateTaskDto.DueDate)
		if err != nil {
			util.Res.Writer(w).Status(400).Data("Invalid due date format. Use ISO 8601 format")
			return
		}
		dueDate = &parsedDate
	}

	// Update task
	task, err := tasks.taskRepository.Update(
		id,
		updateTaskDto.Title,
		updateTaskDto.Description,
		updateTaskDto.AssignedTo,
		dueDate,
		updateTaskDto.Priority,
	)

	if err != nil {
		util.Res.Writer(w).Status(500).Data(err.Error())
		return
	}

	response := tasks.convertToResponseDto(task)
	util.Res.Writer(w).Status().Data(map[string]dto.TaskResponseDto{
		"task": response,
	})
}

func (tasks *Tasks) moveTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		util.Res.Writer(w).Status(400).Data("Invalid task ID")
		return
	}

	moveTaskDto, errors := util.ValidateRequest(r, dto.MoveTaskDto{})

	if errors != nil {
		util.Res.Writer(w).Status422().Data(errors.Error())
		return
	}

	// Check if task exists
	_, err = tasks.taskRepository.FindByID(id)
	if err != nil {
		util.Res.Writer(w).Status(404).Data(err.Error())
		return
	}

	// Validate destination column exists
	_, err = tasks.columnRepository.FindByID(moveTaskDto.ColumnID)
	if err != nil {
		util.Res.Writer(w).Status(400).Data("Invalid column ID")
		return
	}

	// Move task
	err = tasks.taskRepository.MoveToColumn(id, moveTaskDto.ColumnID, moveTaskDto.NewPosition)
	if err != nil {
		util.Res.Writer(w).Status(500).Data(err.Error())
		return
	}

	util.Res.Writer(w).Status().Data(map[string]string{
		"message": "Task moved successfully",
	})
}

// Admin-only endpoints
func (tasks *Tasks) deleteTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		util.Res.Writer(w).Status(400).Data("Invalid task ID")
		return
	}

	// Check if task exists
	_, err = tasks.taskRepository.FindByID(id)
	if err != nil {
		util.Res.Writer(w).Status(404).Data(err.Error())
		return
	}

	err = tasks.taskRepository.Delete(id)
	if err != nil {
		util.Res.Writer(w).Status(500).Data(err.Error())
		return
	}

	util.Res.Writer(w).Status().Data(map[string]string{
		"message": "Task deleted successfully",
	})
}

func (tasks *Tasks) forceUpdateTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		util.Res.Writer(w).Status(400).Data("Invalid task ID")
		return
	}

	updateTaskDto, errors := util.ValidateRequest(r, dto.UpdateTaskDto{})

	if errors != nil {
		util.Res.Writer(w).Status422().Data(errors.Error())
		return
	}

	// Check if task exists
	_, err = tasks.taskRepository.FindByID(id)
	if err != nil {
		util.Res.Writer(w).Status(404).Data(err.Error())
		return
	}

	// Admin can force update any task (no ownership check)
	
	// Validate assigned user exists (if being updated)
	if updateTaskDto.AssignedTo != nil {
		_, err = tasks.userRepository.FindByID(*updateTaskDto.AssignedTo)
		if err != nil {
			util.Res.Writer(w).Status(400).Data("Invalid assigned user ID")
			return
		}
	}

	// Parse due date if provided
	var dueDate *time.Time
	if updateTaskDto.DueDate != nil {
		parsedDate, err := time.Parse(time.RFC3339, *updateTaskDto.DueDate)
		if err != nil {
			util.Res.Writer(w).Status(400).Data("Invalid due date format. Use ISO 8601 format")
			return
		}
		dueDate = &parsedDate
	}

	// Update task
	task, err := tasks.taskRepository.Update(
		id,
		updateTaskDto.Title,
		updateTaskDto.Description,
		updateTaskDto.AssignedTo,
		dueDate,
		updateTaskDto.Priority,
	)

	if err != nil {
		util.Res.Writer(w).Status(500).Data(err.Error())
		return
	}

	response := tasks.convertToResponseDto(task)
	util.Res.Writer(w).Status().Data(map[string]dto.TaskResponseDto{
		"task": response,
	})
}

// Helper methods
func (tasks *Tasks) parseTaskFilter(r *http.Request) dto.TaskFilterDto {
	query := r.URL.Query()
	
	filter := dto.TaskFilterDto{}
	
	if search := strings.TrimSpace(query.Get("search")); search != "" {
		filter.Search = &search
	}
	
	if columnID, err := strconv.Atoi(query.Get("column_id")); err == nil && columnID > 0 {
		filter.ColumnID = &columnID
	}
	
	if assignedTo, err := strconv.Atoi(query.Get("assigned_to")); err == nil && assignedTo > 0 {
		filter.AssignedTo = &assignedTo
	}
	
	if createdBy, err := strconv.Atoi(query.Get("created_by")); err == nil && createdBy > 0 {
		filter.CreatedBy = &createdBy
	}
	
	if priority := query.Get("priority"); priority != "" {
		filter.Priority = &priority
	}
	
	if dueDateFrom := query.Get("due_date_from"); dueDateFrom != "" {
		filter.DueDateFrom = &dueDateFrom
	}
	
	if dueDateTo := query.Get("due_date_to"); dueDateTo != "" {
		filter.DueDateTo = &dueDateTo
	}
	
	if createdFrom := query.Get("created_from"); createdFrom != "" {
		filter.CreatedFrom = &createdFrom
	}
	
	if createdTo := query.Get("created_to"); createdTo != "" {
		filter.CreatedTo = &createdTo
	}
	
	if page, err := strconv.Atoi(query.Get("page")); err == nil && page > 0 {
		filter.Page = &page
	} else {
		defaultPage := 1
		filter.Page = &defaultPage
	}
	
	if pageSize, err := strconv.Atoi(query.Get("page_size")); err == nil && pageSize > 0 && pageSize <= 100 {
		filter.PageSize = &pageSize
	} else {
		defaultPageSize := 20
		filter.PageSize = &defaultPageSize
	}
	
	if orderBy := query.Get("order_by"); orderBy != "" {
		filter.OrderBy = &orderBy
	}
	
	if orderDir := query.Get("order_dir"); orderDir != "" {
		filter.OrderDir = &orderDir
	}
	
	return filter
}

func (tasks *Tasks) convertToRepoFilters(filter dto.TaskFilterDto) repository.TaskFilters {
	repoFilter := repository.TaskFilters{
		Search:    filter.Search,
		ColumnID:  filter.ColumnID,
		AssignedTo: filter.AssignedTo,
		CreatedBy: filter.CreatedBy,
		Priority:  filter.Priority,
	}
	
	// Parse date strings to time.Time
	if filter.DueDateFrom != nil {
		if parsed, err := time.Parse(time.RFC3339, *filter.DueDateFrom); err == nil {
			repoFilter.DueDateFrom = &parsed
		}
	}
	if filter.DueDateTo != nil {
		if parsed, err := time.Parse(time.RFC3339, *filter.DueDateTo); err == nil {
			repoFilter.DueDateTo = &parsed
		}
	}
	if filter.CreatedFrom != nil {
		if parsed, err := time.Parse(time.RFC3339, *filter.CreatedFrom); err == nil {
			repoFilter.CreatedFrom = &parsed
		}
	}
	if filter.CreatedTo != nil {
		if parsed, err := time.Parse(time.RFC3339, *filter.CreatedTo); err == nil {
			repoFilter.CreatedTo = &parsed
		}
	}
	
	// Set pagination
	if filter.Page != nil && filter.PageSize != nil {
		limit := *filter.PageSize
		offset := (*filter.Page - 1) * limit
		repoFilter.Limit = &limit
		repoFilter.Offset = &offset
	}
	
	// Set ordering
	if filter.OrderBy != nil {
		repoFilter.OrderBy = *filter.OrderBy
	} else {
		repoFilter.OrderBy = "position"
	}
	
	if filter.OrderDir != nil {
		repoFilter.OrderDir = *filter.OrderDir
	} else {
		repoFilter.OrderDir = "asc"
	}
	
	return repoFilter
}

func (tasks *Tasks) convertToResponseDto(task *repository.Task) dto.TaskResponseDto {
	response := dto.TaskResponseDto{
		ID:          task.ID,
		Title:       task.Title,
		Description: task.Description,
		ColumnID:    task.ColumnID,
		AssignedTo:  task.AssignedTo,
		CreatedBy:   task.CreatedBy,
		Priority:    task.Priority,
		Position:    task.Position,
		Weight:      task.Weight,
		CreatedAt:   task.CreatedAt.Format(time.RFC3339),
		UpdatedAt:   task.UpdatedAt.Format(time.RFC3339),
		CommentCount: task.CommentCount,
	}
	
	// Handle due date
	if task.DueDate != nil {
		dueDateStr := task.DueDate.Format(time.RFC3339)
		response.DueDate = &dueDateStr
	}
	
	// Handle related data
	if task.AssignedUser != nil {
		name := ""
		if task.AssignedUser.Name != nil {
			name = *task.AssignedUser.Name
		}
		response.AssignedUser = &dto.UserDto{
			ID:       task.AssignedUser.ID,
			UserName: task.AssignedUser.UserName,
			Name:     name,
		}
	}
	
	if task.CreatedByUser != nil {
		name := ""
		if task.CreatedByUser.Name != nil {
			name = *task.CreatedByUser.Name
		}
		response.CreatedByUser = &dto.UserDto{
			ID:       task.CreatedByUser.ID,
			UserName: task.CreatedByUser.UserName,
			Name:     name,
		}
	}
	
	if task.ColumnTitle != nil {
		response.ColumnTitle = task.ColumnTitle
	}
	
	return response
}