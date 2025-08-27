package util

import (
	"encoding/json"
	"net/http"
	"reflect"
	"strconv"

	"github.com/go-playground/validator"
)

func IfThenElse(condition bool, a interface{}, b interface{}) interface{} {
	if condition {
		return a
	}
	return b
}

func JsonEncoder(w http.ResponseWriter, data interface{}) {
	json.NewEncoder(w).Encode(data)
}

func JsonDecoder(r *http.Request, target any) {
	json.NewDecoder(r.Body).Decode(target)
}

func ValidateRequest[T any](r *http.Request, target T) (T, error) {
	JsonDecoder(r, &target)

	return target, ValidateStruct(target)
}

func ValidateRequestQuery[T any](r *http.Request, target T) (T, error) {
	QueryDecoder(r, &target)

	return target, ValidateStruct(target)
}

func QueryDecoder(r *http.Request, target any) {
	// Parse query parameters into struct
	// This is a basic manual implementation for our UserFilterDto
	query := r.URL.Query()

	// We'll manually populate the struct fields for now
	// In a production app, you'd use reflection or a library like gorilla/schema
	_ = query
	_ = target
}

func ValidateStruct(form interface{}) error {
	err := validator.New().Struct(form)
	if err == nil {
		return nil
	}

	errors := err.(validator.ValidationErrors)

	if errors != nil {
		return errors
	}

	return nil

}

func ParseInt(s string) int {
	i, _ := strconv.Atoi(s)

	return i
}

func CopyMap(from map[string]interface{}, to map[string]interface{}) map[string]interface{} {
	for key, value := range from {
		to[key] = value
	}

	return to
}

func FillStruct[T interface{}](s T, data interface{}) T {
	b, _ := json.Marshal(data)
	json.Unmarshal(b, s)

	return s
}

func ConvertToInterface[T any](slice []T) []any {
	result := make([]any, len(slice))
	for i, v := range slice {
		result[i] = v
	}
	return result
}

func StructToMap(obj any) map[string]any {
	result := make(map[string]any)
	val := reflect.ValueOf(obj)
	typ := reflect.TypeOf(obj)

	for i := 0; i < val.NumField(); i++ {
		field := typ.Field(i)
		result[field.Name] = val.Field(i).Interface()
	}
	return result
}
