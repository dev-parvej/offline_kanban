package dto

type ColumnDto struct {
	ID     int    `json:"id"`
	Title  string `json:"title"`
	Colors *string `json:"colors"`
}

type BoardResponseDto struct {
	Columns []ColumnWithTasksDto `json:"columns"`
	Total   int                  `json:"total"`
}

type ColumnWithTasksDto struct {
	Column ColumnDto         `json:"column"`
	Tasks  []TaskResponseDto `json:"tasks"`
}