package dto

type ReorderColumnsDto struct {
	Orders []ColumnsOrder `json:"orders" validate:"required,dive,required"`
}

type ColumnsOrder struct {
	ID       int `validate:"required" json:"id"`
	Position int `validate:"required" json:"position"`
}
