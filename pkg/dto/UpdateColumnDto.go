package dto

type UpdateColumnDto struct {
	Title  *string `validate:"omitempty,lte=100,gte=2" json:"title"`
	Colors *string `validate:"omitempty,lte=50" json:"colors"` // CSS color or hex code
}