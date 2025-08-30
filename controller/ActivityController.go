package controller

import (
	"net/http"
	"strconv"

	"github.com/dev-parvej/offline_kanban/middleware"
	"github.com/dev-parvej/offline_kanban/pkg/database"
	"github.com/dev-parvej/offline_kanban/pkg/dto"
	"github.com/dev-parvej/offline_kanban/pkg/util"
	"github.com/dev-parvej/offline_kanban/repository"
	"github.com/gorilla/mux"
)

type Activities struct {
	router             *mux.Router
	activityRepository *repository.ActivityRepository
	db                 *database.Database
}

func ActivityController(router *mux.Router, db *database.Database) *Activities {
	return &Activities{
		router:             router,
		activityRepository: repository.NewActivityRepository(db),
		db:                 db,
	}
}

func (activities *Activities) Router() {
	// Activity routes (authenticated users only)
	activityRouter := activities.router.PathPrefix("/activities").Subrouter()
	activityRouter.Use(middleware.Authenticate)

	// Activity read operations
	activityRouter.HandleFunc("", activities.getActivities).Methods("GET")
	activityRouter.HandleFunc("/task/{task_id:[0-9]+}", activities.getTaskActivities).Methods("GET")
	activityRouter.HandleFunc("/{id:[0-9]+}", activities.getActivity).Methods("GET")
}

// Get activities with optional filters
func (activities *Activities) getActivities(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	limit := 50 // default limit
	offset := 0 // default offset

	if limitParam := r.URL.Query().Get("limit"); limitParam != "" {
		if parsedLimit, err := strconv.Atoi(limitParam); err == nil && parsedLimit > 0 && parsedLimit <= 100 {
			limit = parsedLimit
		}
	}

	if offsetParam := r.URL.Query().Get("offset"); offsetParam != "" {
		if parsedOffset, err := strconv.Atoi(offsetParam); err == nil && parsedOffset >= 0 {
			offset = parsedOffset
		}
	}

	// Get activities
	activityList, err := activities.activityRepository.GetRecent(limit, offset)
	if err != nil {
		util.Res.Writer(w).Status(500).Data(err.Error())
		return
	}

	// Convert to response DTOs
	var responseDtos []*dto.ActivityResponseDto
	for _, activity := range activityList {
		responseDtos = append(responseDtos, activities.convertToResponseDto(activity))
	}

	response := &dto.ActivityListResponseDto{
		Activities: responseDtos,
		Total:      len(responseDtos),
	}

	util.Res.Writer(w).Status().Data(response)
}

// Get activities for a specific task
func (activities *Activities) getTaskActivities(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	taskId, err := strconv.Atoi(vars["task_id"])

	if err != nil {
		util.Res.Writer(w).Status(400).Data("Invalid task ID")
		return
	}

	// Get task activities
	activityList, err := activities.activityRepository.GetByEntity("task", taskId)
	if err != nil {
		util.Res.Writer(w).Status(500).Data(err.Error())
		return
	}

	// Convert to response DTOs
	var responseDtos []*dto.ActivityResponseDto
	for _, activity := range activityList {
		responseDtos = append(responseDtos, activities.convertToResponseDto(activity))
	}

	response := &dto.ActivityListResponseDto{
		Activities: responseDtos,
		Total:      len(responseDtos),
	}

	util.Res.Writer(w).Status().Data(response)
}

// Get single activity
func (activities *Activities) getActivity(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		util.Res.Writer(w).Status(400).Data("Invalid activity ID")
		return
	}

	activity, err := activities.activityRepository.FindByID(id)
	if err != nil {
		util.Res.Writer(w).Status(404).Data(err.Error())
		return
	}

	response := activities.convertToResponseDto(activity)
	util.Res.Writer(w).Status().Data(map[string]*dto.ActivityResponseDto{
		"activity": response,
	})
}

// Helper method to convert repository Activity to ActivityResponseDto
func (activities *Activities) convertToResponseDto(activity *repository.Activity) *dto.ActivityResponseDto {
	userName := ""
	if activity.UserName != nil {
		userName = *activity.UserName
	}

	return &dto.ActivityResponseDto{
		ID:         activity.ID,
		EntityType: activity.EntityType,
		EntityID:   activity.EntityID,
		Action:     activity.Action,
		FieldName:  activity.FieldName,
		OldValue:   activity.OldValue,
		NewValue:   activity.NewValue,
		UserID:     activity.UserID,
		CreatedAt:  activity.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:  activity.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UserName:   &userName,
		Username:   activity.Username,
	}
}