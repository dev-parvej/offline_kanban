package dto

type CreateColumnDto struct {
	Title  string  `validate:"required,lte=100,gte=2" json:"title"`
	Colors *string `validate:"omitempty,lte=50" json:"colors"` // CSS color or hex code
}