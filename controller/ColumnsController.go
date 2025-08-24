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

type Columns struct {
	router           *mux.Router
	columnRepository *repository.ColumnRepository
	db               *database.Database
}

func ColumnsController(router *mux.Router, db *database.Database) *Columns {
	return &Columns{
		router:           router,
		columnRepository: repository.NewColumnRepository(db),
		db:               db,
	}
}

func (columns *Columns) Router() {
	columnsRouter := columns.router.PathPrefix("/columns").Subrouter()
	
	// Apply authentication middleware first, then root user middleware
	columnsRouter.Use(middleware.Authenticate)
	columnsRouter.Use(middleware.RequireRoot(columns.db))

	// Column CRUD routes
	columnsRouter.HandleFunc("", columns.getAllColumns).Methods("GET")
	columnsRouter.HandleFunc("", columns.createColumn).Methods("POST")
	columnsRouter.HandleFunc("/{id:[0-9]+}", columns.getColumn).Methods("GET")
	columnsRouter.HandleFunc("/{id:[0-9]+}", columns.updateColumn).Methods("PUT")
	columnsRouter.HandleFunc("/{id:[0-9]+}", columns.deleteColumn).Methods("DELETE")

	// Additional column operations
	columnsRouter.HandleFunc("/with-counts", columns.getColumnsWithTaskCounts).Methods("GET")
	columnsRouter.HandleFunc("/with-creators", columns.getColumnsWithCreators).Methods("GET")
	columnsRouter.HandleFunc("/reorder", columns.reorderColumns).Methods("POST")
	columnsRouter.HandleFunc("/{id:[0-9]+}/move-tasks", columns.moveAllTasksFromColumn).Methods("POST")
}

func (columns *Columns) getAllColumns(w http.ResponseWriter, r *http.Request) {
	cols, err := columns.columnRepository.GetAll()

	if err != nil {
		util.Res.Writer(w).Status(500).Data(err.Error())
		return
	}

	util.Res.Writer(w).Status().Data(map[string][]*repository.Column{
		"columns": cols,
	})
}

func (columns *Columns) getColumn(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		util.Res.Writer(w).Status(400).Data("Invalid column ID")
		return
	}

	column, err := columns.columnRepository.FindByID(id)

	if err != nil {
		util.Res.Writer(w).Status(404).Data(err.Error())
		return
	}

	util.Res.Writer(w).Status().Data(map[string]*repository.Column{
		"column": column,
	})
}

func (columns *Columns) createColumn(w http.ResponseWriter, r *http.Request) {
	createColumnDto, errors := util.ValidateRequest(r, dto.CreateColumnDto{})

	if errors != nil {
		util.Res.Writer(w).Status422().Data(errors.Error())
		return
	}

	// Get user ID from header (set by authentication middleware)
	userId := r.Header.Get("user_id")
	if userId == "" {
		util.Res.Writer(w).Status(401).Data("Authentication required")
		return
	}

	userIdInt, err := strconv.Atoi(userId)
	if err != nil {
		util.Res.Writer(w).Status(400).Data("Invalid user ID")
		return
	}

	// Check if column title already exists
	titleExists, err := columns.columnRepository.TitleExists(createColumnDto.Title, nil)
	if err != nil {
		util.Res.Writer(w).Status(500).Data(err.Error())
		return
	}

	if titleExists {
		util.Res.Writer(w).Status(400).Data("Column with this title already exists")
		return
	}

	column, err := columns.columnRepository.Create(createColumnDto.Title, userIdInt, createColumnDto.Colors)

	if err != nil {
		util.Res.Writer(w).Status(500).Data(err.Error())
		return
	}

	util.Res.Writer(w).Status().Data(map[string]*repository.Column{
		"column": column,
	})
}

func (columns *Columns) updateColumn(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		util.Res.Writer(w).Status(400).Data("Invalid column ID")
		return
	}

	updateColumnDto, errors := util.ValidateRequest(r, dto.UpdateColumnDto{})

	if errors != nil {
		util.Res.Writer(w).Status422().Data(errors.Error())
		return
	}

	// Check if new title already exists (if title is being updated)
	if updateColumnDto.Title != nil {
		titleExists, err := columns.columnRepository.TitleExists(*updateColumnDto.Title, &id)
		if err != nil {
			util.Res.Writer(w).Status(500).Data(err.Error())
			return
		}

		if titleExists {
			util.Res.Writer(w).Status(400).Data("Column with this title already exists")
			return
		}
	}

	column, err := columns.columnRepository.Update(id, updateColumnDto.Title, updateColumnDto.Colors)

	if err != nil {
		util.Res.Writer(w).Status(404).Data(err.Error())
		return
	}

	util.Res.Writer(w).Status().Data(map[string]*repository.Column{
		"column": column,
	})
}

func (columns *Columns) deleteColumn(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		util.Res.Writer(w).Status(400).Data("Invalid column ID")
		return
	}

	// Check if this is the last column
	allColumns, err := columns.columnRepository.GetAll()
	if err != nil {
		util.Res.Writer(w).Status(500).Data(err.Error())
		return
	}

	if len(allColumns) <= 1 {
		util.Res.Writer(w).Status(400).Data("Cannot delete the last column")
		return
	}

	err = columns.columnRepository.Delete(id)

	if err != nil {
		util.Res.Writer(w).Status(400).Data(err.Error())
		return
	}

	util.Res.Writer(w).Status().Data(map[string]string{
		"message": "Column deleted successfully",
	})
}

func (columns *Columns) getColumnsWithTaskCounts(w http.ResponseWriter, r *http.Request) {
	cols, err := columns.columnRepository.GetAllWithTaskCounts()

	if err != nil {
		util.Res.Writer(w).Status(500).Data(err.Error())
		return
	}

	util.Res.Writer(w).Status().Data(map[string][]*repository.Column{
		"columns": cols,
	})
}

func (columns *Columns) getColumnsWithCreators(w http.ResponseWriter, r *http.Request) {
	cols, err := columns.columnRepository.GetAllWithCreators()

	if err != nil {
		util.Res.Writer(w).Status(500).Data(err.Error())
		return
	}

	util.Res.Writer(w).Status().Data(map[string][]*repository.Column{
		"columns": cols,
	})
}

func (columns *Columns) reorderColumns(w http.ResponseWriter, r *http.Request) {
	reorderDto, errors := util.ValidateRequest(r, dto.ReorderColumnsDto{})

	if errors != nil {
		util.Res.Writer(w).Status422().Data(errors.Error())
		return
	}

	// Validate that all column IDs exist
	for _, columnID := range reorderDto.ColumnIDs {
		_, err := columns.columnRepository.FindByID(columnID)
		if err != nil {
			util.Res.Writer(w).Status(404).Data("One or more column IDs not found")
			return
		}
	}

	err := columns.columnRepository.Reorder(reorderDto.ColumnIDs)

	if err != nil {
		util.Res.Writer(w).Status(500).Data(err.Error())
		return
	}

	util.Res.Writer(w).Status().Data(map[string]string{
		"message": "Columns reordered successfully",
	})
}

func (columns *Columns) moveAllTasksFromColumn(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	fromColumnID, err := strconv.Atoi(vars["id"])

	if err != nil {
		util.Res.Writer(w).Status(400).Data("Invalid column ID")
		return
	}

	// Get destination column ID from request body
	type MoveTasksRequest struct {
		ToColumnID int `json:"to_column_id" validate:"required,gt=0"`
	}

	requestBody, errors := util.ValidateRequest(r, MoveTasksRequest{})
	
	if errors != nil {
		util.Res.Writer(w).Status422().Data(errors.Error())
		return
	}

	// Validate both columns exist
	_, err = columns.columnRepository.FindByID(fromColumnID)
	if err != nil {
		util.Res.Writer(w).Status(404).Data("Source column not found")
		return
	}

	_, err = columns.columnRepository.FindByID(requestBody.ToColumnID)
	if err != nil {
		util.Res.Writer(w).Status(404).Data("Destination column not found")
		return
	}

	if fromColumnID == requestBody.ToColumnID {
		util.Res.Writer(w).Status(400).Data("Source and destination columns cannot be the same")
		return
	}

	err = columns.columnRepository.MoveAllTasks(fromColumnID, requestBody.ToColumnID)

	if err != nil {
		util.Res.Writer(w).Status(500).Data(err.Error())
		return
	}

	util.Res.Writer(w).Status().Data(map[string]string{
		"message": "All tasks moved successfully",
	})
}