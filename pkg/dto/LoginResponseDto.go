package dto

type LoginResponseDto struct {
	User         UserDto `json:"user"`
	AccessToken  string  `json:"access_token"`
	RefreshToken string  `json:"refresh_token"`
}

type UserDto struct {
	ID          int    `json:"id"`
	UserName    string `json:"username"`
	Name        string `json:"name"`
	Designation string `json:"designation"`
	IsRoot      bool   `json:"is_root"`
	IsActive    bool   `json:"is_active"`
	CreatedAt   string `json:"created_at"`
}