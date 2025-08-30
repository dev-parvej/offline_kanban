package controller

import (
	"net/http"
	"strconv"

	"github.com/dev-parvej/offline_kanban/middleware"
	"github.com/dev-parvej/offline_kanban/pkg/database"
	"github.com/dev-parvej/offline_kanban/pkg/dto"
	"github.com/dev-parvej/offline_kanban/pkg/util"
	"github.com/dev-parvej/offline_kanban/repository"
	"github.com/dev-parvej/offline_kanban/service"
	"github.com/gorilla/mux"
)

type Comments struct {
	router            *mux.Router
	commentRepository *repository.CommentRepository
	taskRepository    *repository.TaskRepository
	commentService    *service.CommentService
	db                *database.Database
}

func CommentController(router *mux.Router, db *database.Database) *Comments {
	return &Comments{
		router:            router,
		commentRepository: repository.NewCommentRepository(db),
		taskRepository:    repository.NewTaskRepository(db),
		commentService:    service.NewCommentService(db),
		db:                db,
	}
}

func (comments *Comments) Router() {
	// Comment routes (authenticated users only)
	commentRouter := comments.router.PathPrefix("/comments").Subrouter()
	commentRouter.Use(middleware.Authenticate)

	// Comment CRUD operations
	commentRouter.HandleFunc("", comments.createComment).Methods("POST")
	commentRouter.HandleFunc("/task/{task_id:[0-9]+}", comments.getCommentsByTask).Methods("GET")
	commentRouter.HandleFunc("/{id:[0-9]+}", comments.getComment).Methods("GET")
	commentRouter.HandleFunc("/{id:[0-9]+}", comments.updateComment).Methods("PUT")
	commentRouter.HandleFunc("/{id:[0-9]+}", comments.deleteComment).Methods("DELETE")
}

// Create a new comment
func (comments *Comments) createComment(w http.ResponseWriter, r *http.Request) {
	createCommentDto, errors := util.ValidateRequest(r, dto.CreateCommentDto{})

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

	// Verify task exists
	_, err = comments.taskRepository.FindByID(createCommentDto.TaskID)
	if err != nil {
		util.Res.Writer(w).Status(404).Data("Task not found")
		return
	}

	// Create comment using service (handles activity tracking)
	comment, err := comments.commentService.CreateComment(
		createCommentDto.Content,
		createCommentDto.TaskID,
		userIdInt,
	)

	if err != nil {
		util.Res.Writer(w).Status(500).Data(err.Error())
		return
	}

	response := comments.convertToResponseDto(comment)
	util.Res.Writer(w).Status().Data(map[string]*dto.CommentResponseDto{
		"comment": response,
	})
}

// Get comments for a specific task
func (comments *Comments) getCommentsByTask(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	taskId, err := strconv.Atoi(vars["task_id"])

	if err != nil {
		util.Res.Writer(w).Status(400).Data("Invalid task ID")
		return
	}

	// Verify task exists
	_, err = comments.taskRepository.FindByID(taskId)
	if err != nil {
		util.Res.Writer(w).Status(404).Data("Task not found")
		return
	}

	// Get comments
	commentList, err := comments.commentRepository.GetByTaskID(taskId)
	if err != nil {
		util.Res.Writer(w).Status(500).Data(err.Error())
		return
	}

	// Convert to response DTOs
	var responseDtos []*dto.CommentResponseDto
	for _, comment := range commentList {
		responseDtos = append(responseDtos, comments.convertToResponseDto(comment))
	}

	response := &dto.CommentListResponseDto{
		Comments: responseDtos,
		Total:    len(responseDtos),
	}

	util.Res.Writer(w).Status().Data(response)
}

// Get single comment
func (comments *Comments) getComment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		util.Res.Writer(w).Status(400).Data("Invalid comment ID")
		return
	}

	comment, err := comments.commentRepository.FindByID(id)
	if err != nil {
		util.Res.Writer(w).Status(404).Data(err.Error())
		return
	}

	response := comments.convertToResponseDto(comment)
	util.Res.Writer(w).Status().Data(map[string]*dto.CommentResponseDto{
		"comment": response,
	})
}

// Update comment
func (comments *Comments) updateComment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		util.Res.Writer(w).Status(400).Data("Invalid comment ID")
		return
	}

	updateCommentDto, errors := util.ValidateRequest(r, dto.UpdateCommentDto{})

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

	// Update comment using service
	comment, err := comments.commentService.UpdateComment(id, updateCommentDto.Content, userIdInt)
	if err != nil {
		util.Res.Writer(w).Status(500).Data(err.Error())
		return
	}

	response := comments.convertToResponseDto(comment)
	util.Res.Writer(w).Status().Data(map[string]*dto.CommentResponseDto{
		"comment": response,
	})
}

// Delete comment
func (comments *Comments) deleteComment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		util.Res.Writer(w).Status(400).Data("Invalid comment ID")
		return
	}

	// Get current user ID
	userId := r.Header.Get("user_id")
	userIdInt, err := strconv.Atoi(userId)
	if err != nil {
		util.Res.Writer(w).Status(400).Data("Invalid user ID")
		return
	}

	// Delete comment using service
	err = comments.commentService.DeleteComment(id, userIdInt)
	if err != nil {
		util.Res.Writer(w).Status(500).Data(err.Error())
		return
	}

	util.Res.Writer(w).Status().Data(map[string]string{
		"message": "Comment deleted successfully",
	})
}

// Helper method to convert repository Comment to CommentResponseDto
func (comments *Comments) convertToResponseDto(comment *repository.Comment) *dto.CommentResponseDto {
	authorName := ""
	if comment.AuthorName != nil {
		authorName = *comment.AuthorName
	}

	return &dto.CommentResponseDto{
		ID:             comment.ID,
		Content:        comment.Content,
		TaskID:         comment.TaskID,
		CreatedBy:      comment.CreatedBy,
		CreatedAt:      comment.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:      comment.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		AuthorName:     authorName,
		AuthorUsername: comment.AuthorUsername,
	}
}