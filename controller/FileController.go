package controller

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/dev-parvej/offline_kanban/middleware"
	"github.com/dev-parvej/offline_kanban/pkg/database"
	"github.com/dev-parvej/offline_kanban/pkg/util"
	"github.com/gorilla/mux"
)

type Files struct {
	router *mux.Router
	db     *database.Database
}

func FileController(router *mux.Router, db *database.Database) *Files {
	return &Files{
		router: router,
		db:     db,
	}
}

func (files *Files) Router() {
	// File upload routes (authenticated users only)
	fileRouter := files.router.PathPrefix("/files").Subrouter()
	fileRouter.Use(middleware.Authenticate)

	// Upload image endpoint
	fileRouter.HandleFunc("/upload/image", files.uploadImage).Methods("POST")

	// Delete image endpoint
	fileRouter.HandleFunc("/delete/image", files.deleteImage).Methods("DELETE")

	// Serve uploaded files (public access for images)
	files.router.PathPrefix("/uploads/").Handler(
		http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads/"))),
	).Methods("GET")
}

func (files *Files) uploadImage(w http.ResponseWriter, r *http.Request) {
	// Limit file size to 10MB
	const maxFileSize = 10 << 20 // 10MB
	r.Body = http.MaxBytesReader(w, r.Body, maxFileSize)

	// Parse multipart form
	if err := r.ParseMultipartForm(maxFileSize); err != nil {
		util.Res.Writer(w).Status(400).Data("File too large or invalid form data")
		return
	}

	// Get the file from form data
	file, handler, err := r.FormFile("image")
	if err != nil {
		util.Res.Writer(w).Status(400).Data("No image file provided")
		return
	}
	defer file.Close()

	// Validate file type
	if !isValidImageType(handler.Filename) {
		util.Res.Writer(w).Status(400).Data("Invalid file type. Only JPG, PNG, GIF, and WebP are allowed")
		return
	}

	// Create uploads directory if it doesn't exist
	uploadsDir := "./uploads/images"
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		util.Res.Writer(w).Status(500).Data("Failed to create upload directory")
		return
	}

	// Generate unique filename
	timestamp := time.Now().Unix()
	ext := filepath.Ext(handler.Filename)
	filename := fmt.Sprintf("%d_%s%s", timestamp, generateRandomString(8), ext)
	filePath := filepath.Join(uploadsDir, filename)

	// Create destination file
	dst, err := os.Create(filePath)
	if err != nil {
		util.Res.Writer(w).Status(500).Data("Failed to create file")
		return
	}
	defer dst.Close()

	// Copy uploaded file to destination
	if _, err := io.Copy(dst, file); err != nil {
		util.Res.Writer(w).Status(500).Data("Failed to save file")
		return
	}

	// Return file URL
	fileURL := fmt.Sprintf("/uploads/images/%s", filename)
	util.Res.Writer(w).Status().Data(map[string]string{
		"url":      fileURL,
		"filename": filename,
		"message":  "Image uploaded successfully",
	})
}

func (files *Files) deleteImage(w http.ResponseWriter, r *http.Request) {
	// Parse request body to get image URLs
	type DeleteImageRequest struct {
		URLs []string `json:"urls"`
	}

	var req DeleteImageRequest

	err, _ := util.ValidateRequest(r, &req)

	if err != nil {
		util.Res.Writer(w).Status(400).Data("Invalid request format")
		return
	}

	if len(req.URLs) == 0 {
		util.Res.Writer(w).Status(400).Data("No image URLs provided")
		return
	}

	deletedCount := 0
	var errors []string

	for _, imageURL := range req.URLs {
		// Extract filename from URL (e.g., "/uploads/images/filename.jpg" -> "filename.jpg")
		if !strings.HasPrefix(imageURL, "/uploads/images/") {
			errors = append(errors, fmt.Sprintf("Invalid image URL: %s", imageURL))
			continue
		}

		filename := strings.TrimPrefix(imageURL, "/uploads/images/")
		if filename == "" {
			errors = append(errors, fmt.Sprintf("Invalid filename from URL: %s", imageURL))
			continue
		}

		// Construct full file path
		filePath := filepath.Join("./uploads/images", filename)

		// Check if file exists and delete it
		if _, err := os.Stat(filePath); err != nil {
			if os.IsNotExist(err) {
				// File doesn't exist, skip
				continue
			}
			errors = append(errors, fmt.Sprintf("Error checking file %s: %v", filename, err))
			continue
		}

		if err := os.Remove(filePath); err != nil {
			errors = append(errors, fmt.Sprintf("Failed to delete %s: %v", filename, err))
			continue
		}

		deletedCount++
	}

	response := map[string]interface{}{
		"deleted_count": deletedCount,
		"message":       fmt.Sprintf("Successfully deleted %d images", deletedCount),
	}

	if len(errors) > 0 {
		response["errors"] = errors
	}

	util.Res.Writer(w).Status().Data(response)
}

// Helper function to validate image file types
func isValidImageType(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	validTypes := []string{".jpg", ".jpeg", ".png", ".gif", ".webp"}

	for _, validType := range validTypes {
		if ext == validType {
			return true
		}
	}
	return false
}

// Helper function to generate random string
func generateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	result := make([]byte, length)
	for i := range result {
		result[i] = charset[time.Now().UnixNano()%int64(len(charset))]
	}
	return string(result)
}
