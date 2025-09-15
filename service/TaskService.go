package service

import (
	"fmt"
	"time"

	"github.com/dev-parvej/offline_kanban/pkg/database"
	"github.com/dev-parvej/offline_kanban/repository"
)

type TaskService struct {
	taskRepository     *repository.TaskRepository
	userRepository     *repository.UserRepository
	columnRepository   *repository.ColumnRepository
	activityRepository *repository.ActivityRepository
}

func NewTaskService(db *database.Database) *TaskService {
	return &TaskService{
		taskRepository:     repository.NewTaskRepository(db),
		userRepository:     repository.NewUserRepository(db),
		columnRepository:   repository.NewColumnRepository(db),
		activityRepository: repository.NewActivityRepository(db),
	}
}

// CreateTask creates a new task and records the activity
func (ts *TaskService) CreateTask(title, description string, columnID, userID int, assignedTo *int, dueDate *time.Time, priority string) (*repository.Task, error) {
	// Create the task
	task, err := ts.taskRepository.Create(title, &description, columnID, userID, assignedTo, dueDate, &priority)
	if err != nil {
		return nil, err
	}

	// Record task creation activity
	err = ts.activityRepository.RecordTaskCreated(task.ID, userID, task.Title)
	if err != nil {
		// Log error but don't fail the request
		fmt.Printf("Failed to record task creation activity: %v\n", err)
	}

	return task, nil
}

// UpdateTask updates a task and records field changes
func (ts *TaskService) UpdateTask(taskID, userID int, title, description *string, assignedTo *int, dueDate *time.Time, priority *string, columnID *int) (*repository.Task, error) {
	// Get existing task for comparison
	existingTask, err := ts.taskRepository.FindByID(taskID)
	if err != nil {
		return nil, err
	}

	// Handle column update if provided
	if columnID != nil && existingTask.ColumnID != *columnID {
		err = ts.moveTaskToColumn(taskID, *columnID, userID)
		if err != nil {
			return nil, err
		}
	}

	// Track field changes before update
	fieldChanges := ts.trackFieldChanges(existingTask, title, description, priority, assignedTo)

	// Update the task
	task, err := ts.taskRepository.Update(taskID, title, description, assignedTo, dueDate, priority)
	if err != nil {
		return nil, err
	}

	// Record field change activities
	for _, change := range fieldChanges {
		err = ts.activityRepository.RecordTaskUpdate(taskID, userID, change.field, change.oldValue, change.newValue)
		if err != nil {
			fmt.Printf("Failed to record task update activity for %s: %v\n", change.field, err)
		}
	}

	return task, nil
}

// DeleteTask deletes a task and records the activity
func (ts *TaskService) DeleteTask(taskID, userID int) error {
	// Get task before deletion for activity tracking
	task, err := ts.taskRepository.FindByID(taskID)
	if err != nil {
		return err
	}

	// Delete the task
	err = ts.taskRepository.Delete(taskID)
	if err != nil {
		return err
	}

	// Record task deletion activity
	err = ts.activityRepository.RecordTaskDeleted(taskID, userID, task.Title)
	if err != nil {
		fmt.Printf("Failed to record task deletion activity: %v\n", err)
	}

	return nil
}

// moveTaskToColumn handles moving a task to a different column
func (ts *TaskService) moveTaskToColumn(taskID, newColumnID, userID int) error {
	// Get existing task
	existingTask, err := ts.taskRepository.FindByID(taskID)
	if err != nil {
		return err
	}

	// Get old and new column names for activity tracking
	oldColumn, _ := ts.columnRepository.FindByID(existingTask.ColumnID)
	newColumn, _ := ts.columnRepository.FindByID(newColumnID)

	// Get task count for the target column to position at the end
	col, _ := ts.columnRepository.GetTaskCount(newColumnID)

	// Move task to new column
	err = ts.taskRepository.MoveToColumn(taskID, newColumnID, col)
	if err != nil {
		return err
	}

	// Record column move activity
	if oldColumn != nil && newColumn != nil {
		err = ts.activityRepository.RecordTaskMoved(taskID, userID, oldColumn.Title, newColumn.Title)
		if err != nil {
			fmt.Printf("Failed to record task move activity: %v\n", err)
		}
	}

	return nil
}

// trackFieldChanges compares existing task with updates and returns changes
func (ts *TaskService) trackFieldChanges(existing *repository.Task, title, description, priority *string, assignedTo *int) []fieldChange {
	var changes []fieldChange

	// Track title changes
	if title != nil && *title != existing.Title {
		changes = append(changes, fieldChange{
			field:    "title",
			oldValue: existing.Title,
			newValue: *title,
		})
	}

	// Track description changes
	if description != nil && *description != *existing.Description {
		var oldDesc string
		if existing.Description == nil || *existing.Description == "" {
			oldDesc = "(empty)"
		} else {
			oldDesc = *existing.Description
		}
		changes = append(changes, fieldChange{
			field:    "description",
			oldValue: oldDesc,
			newValue: *description,
		})
	}

	// Track priority changes
	if priority != nil && *priority != *existing.Priority {
		changes = append(changes, fieldChange{
			field:    "priority",
			oldValue: *existing.Priority,
			newValue: *priority,
		})
	}

	// Track assignment changes
	if assignedTo != nil {
		oldAssigneeID := 0
		if existing.AssignedTo != nil {
			oldAssigneeID = *existing.AssignedTo
		}
		if oldAssigneeID != *assignedTo {
			oldAssignee := "Unassigned"
			newAssignee := "Unassigned"

			if oldAssigneeID > 0 {
				if user, err := ts.userRepository.FindByID(oldAssigneeID); err == nil {
					oldAssignee = *user.Name
				}
			}

			if *assignedTo > 0 {
				if user, err := ts.userRepository.FindByID(*assignedTo); err == nil {
					newAssignee = *user.Name
				}
			}

			changes = append(changes, fieldChange{
				field:    "assignee",
				oldValue: oldAssignee,
				newValue: newAssignee,
			})
		}
	}

	return changes
}

// fieldChange represents a field change for activity tracking
type fieldChange struct {
	field    string
	oldValue string
	newValue string
}
