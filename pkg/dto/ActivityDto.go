package dto

// ActivityResponseDto for API responses
type ActivityResponseDto struct {
	ID         int     `json:"id"`
	EntityType string  `json:"entity_type"`
	EntityID   int     `json:"entity_id"`
	Action     string  `json:"action"`
	FieldName  *string `json:"field_name"`
	OldValue   *string `json:"old_value"`
	NewValue   *string `json:"new_value"`
	UserID     int     `json:"user_id"`
	CreatedAt  string  `json:"created_at"`
	UpdatedAt  string  `json:"updated_at"`
	UserName   *string `json:"user_name"`
	Username   string  `json:"username"`
}

// ActivityListResponseDto for listing activities
type ActivityListResponseDto struct {
	Activities []*ActivityResponseDto `json:"activities"`
	Total      int                    `json:"total"`
}

// GetActivitiesQueryDto for query parameters
type GetActivitiesQueryDto struct {
	EntityType *string `validate:"omitempty,oneof=task column user" json:"entity_type"`
	EntityID   *int    `validate:"omitempty,gt=0" json:"entity_id"`
	Limit      *int    `validate:"omitempty,min=1,max=100" json:"limit"`
	Offset     *int    `validate:"omitempty,min=0" json:"offset"`
}

// Helper function to create ActivityResponseDto
func NewActivityResponseDto() *ActivityResponseDto {
	return &ActivityResponseDto{}
}